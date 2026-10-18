import { useState, useCallback } from 'react';
import type { Employee } from './types';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [employee, setEmployee] = useState<Employee | null>(null);

  const handleLogin = useCallback((emp: Employee) => {
    setEmployee(emp);
  }, []);

  const handleLogout = useCallback(() => {
    setEmployee(null);
  }, []);

  if (!employee) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardPage
      employee={employee}
      onLogout={handleLogout}
    />
  );
}
