package retrieval

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
)

// Customer represents a synthetic enterprise business client.
type Customer struct {
	ID                         string `json:"id"`
	DisplayName                string `json:"displayName"`
	SyntheticExternalReference string `json:"syntheticExternalReference"`
	SensitivityClass           string `json:"sensitivityClass"`
}

// Transaction represents a financial transaction record.
type Transaction struct {
	ID         string    `json:"id"`
	CustomerID string    `json:"customerId"`
	Category   string    `json:"category"`
	Amount     float64   `json:"amount"`
	OccurredAt time.Time `json:"occurredAt"`
	Notes      string    `json:"notes,omitempty"`
}

// AggregateSummary represents aggregated financial metrics without line items.
type AggregateSummary struct {
	AccountRef        string             `json:"accountRef"`
	CustomerName      string             `json:"customerName"`
	TotalTransactions int                `json:"totalTransactions"`
	TotalAmount       float64            `json:"totalAmount"`
	AverageAmount     float64            `json:"averageAmount"`
	CategoryBreakdown map[string]float64 `json:"categoryBreakdown"`
	DateRange         string             `json:"dateRange"`
}

// Store defines data retrieval operations for authorized records.
type Store interface {
	GetCustomerByAccountRef(ctx context.Context, ref string) (*Customer, error)
	GetTransactionsByCustomerID(ctx context.Context, customerID string) ([]Transaction, error)
	GetAggregateSummary(ctx context.Context, accountRef string) (*AggregateSummary, error)
	Close() error
}

// ── Synthetic In-Memory Store ─────────────────────────────────────

type MemoryStore struct {
	customers    map[string]Customer
	transactions map[string][]Transaction
}

func NewMemoryStore() *MemoryStore {
	m := &MemoryStore{
		customers:    make(map[string]Customer),
		transactions: make(map[string][]Transaction),
	}

	// Seed Account 9577690 (Apex Global Logistics Corp)
	custApex := Customer{
		ID:                         "cust_apex_01",
		DisplayName:                "Apex Global Logistics Corp",
		SyntheticExternalReference: "9577690",
		SensitivityClass:           "HIGH",
	}
	m.customers["9577690"] = custApex

	t1, _ := time.Parse(time.RFC3339, "2026-10-15T14:32:00Z")
	t2, _ := time.Parse(time.RFC3339, "2026-10-14T09:15:00Z")
	t3, _ := time.Parse(time.RFC3339, "2026-10-12T18:45:00Z")
	t4, _ := time.Parse(time.RFC3339, "2026-10-10T11:20:00Z")

	m.transactions["cust_apex_01"] = []Transaction{
		{ID: "tx_9577_01", CustomerID: "cust_apex_01", Category: "Office Equipment", Amount: 820.50, OccurredAt: t1, Notes: "Quarterly ergonomic supplies invoice #4812"},
		{ID: "tx_9577_02", CustomerID: "cust_apex_01", Category: "Cloud Infrastructure", Amount: 400.00, OccurredAt: t2, Notes: "Monthly compute capacity allocation"},
		{ID: "tx_9577_03", CustomerID: "cust_apex_01", Category: "Corporate Travel", Amount: 200.00, OccurredAt: t3, Notes: "Rail transit ticket for regional conference"},
		{ID: "tx_9577_04", CustomerID: "cust_apex_01", Category: "Software Subscriptions", Amount: 350.00, OccurredAt: t4, Notes: "Annual dev tooling team seat renewal"},
	}

	// Seed Account 1029384 (Beacon Tech Solutions)
	custBeacon := Customer{
		ID:                         "cust_beacon_02",
		DisplayName:                "Beacon Tech Solutions",
		SyntheticExternalReference: "1029384",
		SensitivityClass:           "STANDARD",
	}
	m.customers["1029384"] = custBeacon
	m.transactions["cust_beacon_02"] = []Transaction{
		{ID: "tx_1029_01", CustomerID: "cust_beacon_02", Category: "Marketing Services", Amount: 1500.00, OccurredAt: t1, Notes: "Q3 digital marketing retainer"},
	}

	return m
}

func (m *MemoryStore) GetCustomerByAccountRef(ctx context.Context, ref string) (*Customer, error) {
	if c, ok := m.customers[ref]; ok {
		return &c, nil
	}
	return nil, fmt.Errorf("customer account '%s' not found", ref)
}

func (m *MemoryStore) GetTransactionsByCustomerID(ctx context.Context, customerID string) ([]Transaction, error) {
	if txs, ok := m.transactions[customerID]; ok {
		return txs, nil
	}
	return []Transaction{}, nil
}

func (m *MemoryStore) GetAggregateSummary(ctx context.Context, accountRef string) (*AggregateSummary, error) {
	cust, err := m.GetCustomerByAccountRef(ctx, accountRef)
	if err != nil {
		return nil, err
	}

	txs, err := m.GetTransactionsByCustomerID(ctx, cust.ID)
	if err != nil {
		return nil, err
	}

	var total float64
	categories := make(map[string]float64)
	for _, tx := range txs {
		total += tx.Amount
		categories[tx.Category] += tx.Amount
	}

	avg := 0.0
	if len(txs) > 0 {
		avg = total / float64(len(txs))
	}

	return &AggregateSummary{
		AccountRef:        accountRef,
		CustomerName:      cust.DisplayName,
		TotalTransactions: len(txs),
		TotalAmount:       total,
		AverageAmount:     avg,
		CategoryBreakdown: categories,
		DateRange:         "Oct 10 - Oct 15, 2026",
	}, nil
}

func (m *MemoryStore) Close() error {
	return nil
}

// ── PostgreSQL Store (Parameterized Queries) ───────────────────────

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, err
	}

	return &PostgresStore{db: db}, nil
}

func (p *PostgresStore) GetCustomerByAccountRef(ctx context.Context, ref string) (*Customer, error) {
	query := `SELECT id, display_name, synthetic_external_reference, sensitivity_class 
              FROM customers WHERE synthetic_external_reference = $1 LIMIT 1`

	var c Customer
	err := p.db.QueryRowContext(ctx, query, ref).Scan(&c.ID, &c.DisplayName, &c.SyntheticExternalReference, &c.SensitivityClass)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (p *PostgresStore) GetTransactionsByCustomerID(ctx context.Context, customerID string) ([]Transaction, error) {
	query := `SELECT id, customer_id, category, amount, occurred_at, notes 
              FROM transactions WHERE customer_id = $1 ORDER BY occurred_at DESC`

	rows, err := p.db.QueryContext(ctx, query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var txs []Transaction
	for rows.Next() {
		var tx Transaction
		var notes sql.NullString
		if err := rows.Scan(&tx.ID, &tx.CustomerID, &tx.Category, &tx.Amount, &tx.OccurredAt, &notes); err != nil {
			return nil, err
		}
		if notes.Valid {
			tx.Notes = notes.String
		}
		txs = append(txs, tx)
	}
	return txs, nil
}

func (p *PostgresStore) GetAggregateSummary(ctx context.Context, accountRef string) (*AggregateSummary, error) {
	cust, err := p.GetCustomerByAccountRef(ctx, accountRef)
	if err != nil {
		return nil, err
	}

	txs, err := p.GetTransactionsByCustomerID(ctx, cust.ID)
	if err != nil {
		return nil, err
	}

	var total float64
	categories := make(map[string]float64)
	for _, tx := range txs {
		total += tx.Amount
		categories[tx.Category] += tx.Amount
	}

	avg := 0.0
	if len(txs) > 0 {
		avg = total / float64(len(txs))
	}

	return &AggregateSummary{
		AccountRef:        accountRef,
		CustomerName:      cust.DisplayName,
		TotalTransactions: len(txs),
		TotalAmount:       total,
		AverageAmount:     avg,
		CategoryBreakdown: categories,
		DateRange:         "October 2026",
	}, nil
}

func (p *PostgresStore) Close() error {
	return p.db.Close()
}
