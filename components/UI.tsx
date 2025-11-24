
import React, { useEffect } from 'react';
import { LucideIcon, X } from 'lucide-react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`neumorphic-card p-5 relative overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}
  >
    {children}
  </div>
);

export interface ButtonProps { 
  children?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; 
  onClick?: () => void; 
  className?: string;
  fullWidth?: boolean;
  icon?: LucideIcon;
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  fullWidth = false,
  icon: Icon,
  title
}) => {
  const baseStyle = "flex items-center justify-center font-semibold rounded-xl py-3 px-6 transition-all active:scale-95 duration-200";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50",
    secondary: "bg-white text-slate-700 border border-slate-100 shadow-md hover:bg-slate-50",
    danger: "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg shadow-red-500/30",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      title={title}
    >
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  );
};

export interface InputProps { 
  label?: string; 
  type?: string; 
  placeholder?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange,
  icon: Icon
}) => (
  <div className="mb-4">
    {label && <label className="block text-slate-600 text-sm font-medium mb-2 ml-1">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
          <Icon size={20} />
        </div>
      )}
      <input
        type={type}
        className={`w-full bg-slate-50 text-slate-800 border-none rounded-2xl py-3.5 ${Icon ? 'pl-12' : 'pl-4'} pr-4 neumorphic-inset focus:ring-2 focus:ring-blue-300 outline-none transition-all placeholder:text-slate-400`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

export interface TextAreaProps { 
  label?: string; 
  placeholder?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  placeholder, 
  value, 
  onChange,
  rows = 4
}) => (
  <div className="mb-4">
    {label && <label className="block text-slate-600 text-sm font-medium mb-2 ml-1">{label}</label>}
    <textarea
      className="w-full bg-slate-50 text-slate-800 border-none rounded-2xl py-3.5 px-4 neumorphic-inset focus:ring-2 focus:ring-blue-300 outline-none transition-all placeholder:text-slate-400 resize-none"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
    />
  </div>
);

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  icon?: LucideIcon;
}

export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, icon: Icon }) => (
  <div className="mb-4">
    {label && <label className="block text-slate-600 text-sm font-medium mb-2 ml-1">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
          <Icon size={20} />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-50 text-slate-800 border-none rounded-2xl py-3.5 ${Icon ? 'pl-12' : 'pl-4'} pr-8 neumorphic-inset focus:ring-2 focus:ring-blue-300 outline-none transition-all appearance-none cursor-pointer`}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  </div>
);

export interface BadgeProps {
  children?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export interface HeaderProps {
  title: string;
  subtitle?: string;
  userAvatar?: string;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, userAvatar, onProfileClick }) => (
  <div className="flex items-center gap-5 mb-8 w-full">
    {userAvatar && (
      <button onClick={onProfileClick} className="relative group shrink-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
        <img 
          src={userAvatar} 
          alt="Profile" 
          className="relative w-14 h-14 rounded-full object-cover border-2 border-white cursor-pointer shadow-sm bg-white" 
        />
      </button>
    )}
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
  </div>
);

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'info' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 text-slate-800 ${type === 'success' ? 'bg-green-50/90' : 'bg-white/90'}`}>
        <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
         <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full hover:bg-slate-100">
              <X size={20} />
            </button>
         </div>
         <div className="p-6 overflow-y-auto custom-scrollbar">
            {children}
         </div>
      </div>
    </div>
  );
};
