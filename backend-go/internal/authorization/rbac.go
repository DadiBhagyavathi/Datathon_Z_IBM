package authorization

import (
	"strings"

	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/auth"
)

// Reason codes for authorization outcomes
const (
	ReasonAuthOK           = "AUTH_OK"
	ReasonAuthOKAggregate  = "AUTH_OK_AGGREGATE"
	ReasonRBACNoPermission = "RBAC_NO_PERMISSION"
	ReasonPromptInjection  = "PROMPT_INJECTION_DETECTED"
	ReasonAccountNotFound  = "ACCOUNT_NOT_FOUND"
)

// HasPermission checks if the employee has the specified permission.
func HasPermission(emp *auth.Employee, perm string) bool {
	if emp == nil {
		return false
	}
	for _, p := range emp.Permissions {
		if strings.EqualFold(p, perm) {
			return true
		}
	}
	return false
}

// CanAccessAccount evaluates if an employee can perform an operation on a target account.
// Returns (isAllowed, reasonCode).
func CanAccessAccount(emp *auth.Employee, accountRef string, isAggregateQuery bool) (bool, string) {
	if emp == nil {
		return false, ReasonRBACNoPermission
	}

	// Intern role has 0 permissions: always fail-closed
	if emp.RoleID == auth.RoleIntern {
		return false, ReasonRBACNoPermission
	}

	// Branch staff can only access aggregate metrics
	if emp.RoleID == auth.RoleBranchStaff {
		if isAggregateQuery && HasPermission(emp, auth.PermReadAggregate) {
			return true, ReasonAuthOKAggregate
		}
		return false, ReasonRBACNoPermission
	}

	// Senior analyst can access both detailed and aggregate records
	if emp.RoleID == auth.RoleSeniorAnalyst {
		if isAggregateQuery && HasPermission(emp, auth.PermReadAggregate) {
			return true, ReasonAuthOKAggregate
		}
		if HasPermission(emp, auth.PermReadDetail) {
			return true, ReasonAuthOK
		}
	}

	return false, ReasonRBACNoPermission
}
