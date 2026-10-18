package auth

import (
	"errors"
	"net/http"
	"strings"
)

// Role constants
const (
	RoleSeniorAnalyst = "senior_analyst"
	RoleBranchStaff   = "branch_staff"
	RoleIntern        = "intern"
)

// Permission constants
const (
	PermReadDetail    = "READ_DETAIL"
	PermReadAggregate = "READ_AGGREGATE"
)

// Employee represents an enterprise employee identity in the security domain.
type Employee struct {
	ID          string   `json:"id"`
	DisplayName string   `json:"displayName"`
	RoleID      string   `json:"roleId"`
	RoleName    string   `json:"roleName"`
	Email       string   `json:"email"`
	Permissions []string `json:"permissions"`
	AccessLevel string   `json:"accessLevel"` // "full", "aggregate", "none"
	Description string   `json:"description"`
}

// Built-in synthetic personas matching the frontend definition
var defaultEmployees = map[string]Employee{
	"emp_analyst_01": {
		ID:          "emp_analyst_01",
		DisplayName: "Alice Vance",
		RoleID:      RoleSeniorAnalyst,
		RoleName:    "Senior Financial Analyst",
		Email:       "alice.vance@fictional-bank.com",
		Permissions: []string{PermReadDetail, PermReadAggregate},
		AccessLevel: "full",
		Description: "Full access to line-item transactions and aggregate summaries.",
	},
	"emp_branch_02": {
		ID:          "emp_branch_02",
		DisplayName: "Bob Martinez",
		RoleID:      RoleBranchStaff,
		RoleName:    "Regional Branch Staff",
		Email:       "bob.martinez@fictional-bank.com",
		Permissions: []string{PermReadAggregate},
		AccessLevel: "aggregate",
		Description: "Aggregate summaries only. No access to individual records.",
	},
	"emp_intern_03": {
		ID:          "emp_intern_03",
		DisplayName: "Charlie Smith",
		RoleID:      RoleIntern,
		RoleName:    "Summer Intern",
		Email:       "charlie.smith@fictional-bank.com",
		Permissions: []string{},
		AccessLevel: "none",
		Description: "No production record permissions. All requests are denied.",
	},
}

// GetEmployeeByID retrieves an employee persona by ID.
func GetEmployeeByID(id string) (*Employee, error) {
	if emp, exists := defaultEmployees[id]; exists {
		return &emp, nil
	}
	return nil, errors.New("employee not found")
}

// GetEmployeeByRole retrieves an employee persona by Role.
func GetEmployeeByRole(role string) (*Employee, error) {
	for _, emp := range defaultEmployees {
		if strings.EqualFold(emp.RoleID, role) {
			return &emp, nil
		}
	}
	return nil, errors.New("role not recognized")
}

// AuthenticateRequest extracts the employee identity from headers:
// 1. "X-Demo-User-Id"
// 2. "X-Demo-User-Role"
// 3. Fallback to Senior Analyst for exploratory calls
func AuthenticateRequest(r *http.Request) *Employee {
	// 1. Check direct User ID header
	if uid := r.Header.Get("X-Demo-User-Id"); uid != "" {
		if emp, err := GetEmployeeByID(uid); err == nil {
			return emp
		}
	}

	// 2. Check Role header
	if role := r.Header.Get("X-Demo-User-Role"); role != "" {
		if emp, err := GetEmployeeByRole(role); err == nil {
			return emp
		}
	}

	// 3. Check query param for easy curl testing (?role=intern)
	if role := r.URL.Query().Get("role"); role != "" {
		if emp, err := GetEmployeeByRole(role); err == nil {
			return emp
		}
	}

	// 4. Default persona is Senior Analyst
	emp := defaultEmployees["emp_analyst_01"]
	return &emp
}

// GetAllEmployees returns all synthetic employees for demo inspection.
func GetAllEmployees() []Employee {
	employees := make([]Employee, 0, len(defaultEmployees))
	for _, emp := range defaultEmployees {
		employees = append(employees, emp)
	}
	return employees
}
