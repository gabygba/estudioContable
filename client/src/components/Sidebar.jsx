import { BriefcaseBusiness, CircleDollarSign, Users } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: CircleDollarSign },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'employees', label: 'Empleados', icon: BriefcaseBusiness },
];

export function Sidebar({ activeSection, onSectionChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">EC</div>
        <div>
          <strong>Estudio Contable</strong>
          <span>Cuenta corriente</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Principal">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={activeSection === item.id ? 'nav-item active' : 'nav-item'}
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              type="button"
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
