import { useEffect, useState } from 'react';

const CONFIG_KEY = '_PA_PROXY_';

interface IConfig {
  host: string;
  port: string;
}

interface Profile {
  id: string;
  name: string;
  host: string;
  port: string;
  httpEnabled: boolean;
  socksEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

interface FormItemProps {
  name: string;
  label: string;
  value?: string;
  onChange?: (data: FormItemChangeData) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

interface FormItemChangeData {
  name: string;
  value: string;
}

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'danger' | 'ghost';
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

// 图标组件
const Icons = {
  Host: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  Port: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Save: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  PowerOn: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  PowerOff: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Error: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Proxy: ({ status }: { status?: 'on' | 'off' }) => {
    const isOn = status === 'on';
    return (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        {isOn && (
          <circle cx="12" cy="12" r="3" className="fill-emerald-400 animate-pulse" />
        )}
      </svg>
    );
  },
  Folder: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const Button: React.FC<ButtonProps> = props => {
  const { children, onClick, disabled = false, loading = false, variant = 'primary', className = '', fullWidth = false } = props;

  const baseStyles = 'relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 focus:ring-purple-500',
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 focus:ring-green-500',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:ring-red-500',
    ghost: 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600 focus:ring-gray-500',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed transform-none hover:shadow-none' : '';
  const loadingStyles = loading ? 'cursor-wait' : '';
  const fullWidthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type='button'
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${loadingStyles} ${fullWidthStyles} ${className}`}
      onClick={() => !disabled && !loading && onClick && onClick()}
      disabled={disabled || loading}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

const FormItem: React.FC<FormItemProps> = props => {
  const { name, label, value, onChange, onSubmit, placeholder, disabled = false } = props;
  const [val, setVal] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name: inputName, value: inputValue } = e.target;
    setVal(inputValue);
    onChange && onChange({ name: inputName, value: inputValue });
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit && onSubmit();
  };

  const IconComponent = label === 'Host' ? Icons.Host : Icons.Port;

  return (
    <div className='group'>
      <label className='block text-[10px] font-medium text-gray-400 mb-1 ml-0.5 uppercase tracking-wider'>
        {label}
      </label>
      <form onSubmit={onFormSubmit} className='relative'>
        <div className={`
          relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
          bg-gray-800/50 border transition-all duration-300
          ${focused
            ? 'border-violet-500 shadow-lg shadow-violet-500/20 bg-gray-800'
            : 'border-gray-700/50 hover:border-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <span className={`transition-colors duration-300 ${focused ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
            <IconComponent />
          </span>
          <input
            type='text'
            name={name}
            className='flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-500 text-sm font-medium'
            value={val}
            onChange={onInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            disabled={disabled}
            autoComplete='off'
          />
        </div>
      </form>
    </div>
  );
};

const Checkbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ label, checked, onChange, disabled = false }) => {
  return (
    <label className={`
      flex items-center gap-2 cursor-pointer transition-opacity
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}>
      <div className='relative'>
        <input
          type='checkbox'
          className='sr-only'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`
          w-4 h-4 rounded border-2 transition-all duration-200
          flex items-center justify-center
          ${checked
            ? 'bg-violet-600 border-violet-600'
            : 'bg-gray-800 border-gray-600 hover:border-gray-500'
          }
        `}>
          {checked && (
            <svg className='w-3 h-3 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          )}
        </div>
      </div>
      <span className='text-xs text-gray-300'>{label}</span>
    </label>
  );
};

const StatusBadge: React.FC<{ status: 'on' | 'off' }> = ({ status }) => {
  return null;
};

const Message: React.FC<{ type: 'success' | 'error'; text: string; onClose: () => void }> = ({ type, text, onClose }) => {
  const is_success = type === 'success';

  return (
    <div
      className={`
        fixed top-4 left-1/2 z-50
        -translate-x-1/2
        flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl
        transform transition-all duration-300
        ${is_success
          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
          : 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
        }
        message-center
      `}
    >
      <span>
        {is_success ? <Icons.Check /> : <Icons.Error />}
      </span>
      <span className={`flex-1 text-xs font-medium whitespace-nowrap`}>
        {text}
      </span>
      <button
        onClick={onClose}
        className='p-0.5 rounded-lg hover:bg-white/20 transition-colors'
        title="Close"
        aria-label="Close"
      >
        <Icons.Error />
      </button>
    </div>
  );
};

// Profile Selector Component
const ProfileSelector: React.FC<{
  profiles: Profile[];
  activeProfile: Profile | null;
  onSelectProfile: (profile: Profile) => void;
  onNewProfile: () => void;
  onEditProfile: (profile: Profile) => void;
  onDeleteProfile: (profile: Profile) => void;
  disabled?: boolean;
}> = ({ profiles, activeProfile, onSelectProfile, onNewProfile, onEditProfile, onDeleteProfile, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative'>
      <label className='block text-[10px] font-medium text-gray-400 mb-1 ml-0.5 uppercase tracking-wider'>
        Profile
      </label>
      <div className='relative'>
        <button
          type='button'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl
            bg-gray-800/50 border transition-all duration-300
            ${isOpen
              ? 'border-violet-500 shadow-lg shadow-violet-500/20 bg-gray-800'
              : 'border-gray-700/50 hover:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className='flex items-center gap-2.5'>
            <span className={`transition-colors duration-300 ${isOpen ? 'text-violet-400' : 'text-gray-500'}`}>
              <Icons.Folder />
            </span>
            <span className='text-sm font-medium text-gray-100'>
              {activeProfile ? activeProfile.name : 'Select a profile'}
            </span>
          </div>
          <span className={`transition-colors duration-300 ${isOpen ? 'text-violet-400' : 'text-gray-500'}`}>
            <Icons.ChevronDown />
          </span>
        </button>

        {isOpen && (
          <>
            <div
              className='fixed inset-0 z-10'
              onClick={() => setIsOpen(false)}
            />
            <div className='absolute z-20 w-full mt-1.5 py-1.5 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto'>
              {profiles.length === 0 ? (
                <div className='px-3 py-2 text-xs text-gray-500 text-center'>
                  No profiles yet
                </div>
              ) : (
                profiles.map(profile => (
                  <div
                    key={profile.id}
                    className='group flex items-center gap-2 px-3 py-2 hover:bg-gray-700/50 cursor-pointer transition-colors'
                    onClick={() => {
                      onSelectProfile(profile);
                      setIsOpen(false);
                    }}
                  >
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium text-gray-200 truncate'>
                          {profile.name}
                        </span>
                        {activeProfile?.id === profile.id && (
                          <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
                        )}
                      </div>
                      <span className='text-[10px] text-gray-500'>
                        {profile.host}:{profile.port}
                      </span>
                    </div>
                    <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProfile(profile);
                        }}
                        className='p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-violet-400 transition-colors'
                        title='Edit profile'
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProfile(profile);
                        }}
                        className='p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-rose-400 transition-colors'
                        title='Delete profile'
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className='border-t border-gray-700 mt-1 pt-1'>
                <button
                  onClick={() => {
                    onNewProfile();
                    setIsOpen(false);
                  }}
                  className='w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-violet-400 hover:bg-violet-500/10 transition-colors'
                >
                  <Icons.Plus />
                  New Profile
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Profile Modal Component
const ProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; host: string; port: string; httpEnabled: boolean; socksEnabled: boolean }) => void;
  profile?: Profile | null;
}> = ({ isOpen, onClose, onSave, profile }) => {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [httpEnabled, setHttpEnabled] = useState(true);
  const [socksEnabled, setSocksEnabled] = useState(true);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setHost(profile.host);
      setPort(profile.port);
      setHttpEnabled(profile.httpEnabled);
      setSocksEnabled(profile.socksEnabled);
    } else {
      setName('');
      setHost('');
      setPort('');
      setHttpEnabled(true);
      setSocksEnabled(true);
    }
  }, [profile, isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), host, port, httpEnabled, socksEnabled });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-5 animate-slideIn'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-sm font-semibold text-white'>
            {profile ? 'Edit Profile' : 'New Profile'}
          </h3>
          <button
            onClick={onClose}
            className='p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors'
          >
            <Icons.Close />
          </button>
        </div>

        <div className='space-y-3'>
          <div>
            <label className='block text-[10px] font-medium text-gray-400 mb-1 ml-0.5 uppercase tracking-wider'>
              Profile Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., Home, Work, Public'
              className='w-full px-3.5 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors'
              autoFocus
            />
          </div>

          <FormItem
            name='modal-host'
            label='Host'
            value={host}
            onChange={(data) => setHost(data.value)}
            placeholder='127.0.0.1'
          />

          <FormItem
            name='modal-port'
            label='Port'
            value={port}
            onChange={(data) => setPort(data.value)}
            placeholder='1082'
          />

          <div className='flex gap-4 pt-1'>
            <Checkbox
              label='HTTP/HTTPS'
              checked={httpEnabled}
              onChange={setHttpEnabled}
            />
            <Checkbox
              label='SOCKS'
              checked={socksEnabled}
              onChange={setSocksEnabled}
            />
          </div>
        </div>

        <div className='flex gap-2 mt-5'>
          <Button
            variant='ghost'
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleSubmit}
            disabled={!name.trim() || !host || !port}
            fullWidth
          >
            {profile ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  profileName: string;
}> = ({ isOpen, onClose, onConfirm, profileName }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-5 animate-slideIn'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center'>
            <Icons.Error />
          </div>
          <div>
            <h3 className='text-sm font-semibold text-white'>Delete Profile</h3>
            <p className='text-xs text-gray-400'>This action cannot be undone</p>
          </div>
        </div>

        <p className='text-xs text-gray-300 mb-5 ml-13'>
          Are you sure you want to delete the profile "<span className='font-medium text-white'>{profileName}</span>"?
        </p>

        <div className='flex gap-2'>
          <Button
            variant='ghost'
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant='danger'
            onClick={onConfirm}
            fullWidth
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [httpEnabled, setHttpEnabled] = useState(true);
  const [socksEnabled, setSocksEnabled] = useState(true);
  const [proxyStatus, setProxyStatus] = useState<'on' | 'off'>('off');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savedHost, setSavedHost] = useState('');
  const [savedPort, setSavedPort] = useState('');

  // Profile states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);

  const getConfig = (): IConfig | null => {
    const data = localStorage.getItem(CONFIG_KEY);
    if (!data) return null;
    return JSON.parse(data);
  };

  useEffect(() => {
    // Load profiles
    loadProfiles();

    const config = getConfig();
    if (config) {
      setHost(config.host);
      setPort(config.port);
      setSavedHost(config.host);
      setSavedPort(config.port);
    }

    // 获取当前代理状态和配置
    Promise.all([
      window.proxyAPI.getStatus(),
      window.proxyAPI.getConfig()
    ]).then(([status, proxyConfig]) => {
      console.log({ status, proxyConfig });
      setProxyStatus(status as 'on' | 'off');

      // 如果代理已开启，总是使用系统实际配置（覆盖 localStorage）
      if (status === 'on') {
        setHttpEnabled(proxyConfig.httpEnabled);
        setSocksEnabled(proxyConfig.socksEnabled);
        // 如果系统有实际的 host 和 port，显示到界面上
        if (proxyConfig.host && proxyConfig.port) {
          setHost(proxyConfig.host);
          setPort(proxyConfig.port);
          setSavedHost(proxyConfig.host);
          setSavedPort(proxyConfig.port);
        }
      }
    });

    window.proxyAPI.onProxyStatusChange(status => {
      setProxyStatus(status as 'on' | 'off');
    });

    return () => {
      window.proxyAPI.removeProxyStatusChangeListener();
    };
  }, []);

  const loadProfiles = async () => {
    try {
      const allProfiles = await window.profileAPI.getProfiles();
      setProfiles(allProfiles);

      const active = await window.profileAPI.getActiveProfile();
      if (active) {
        setActiveProfile(active);
        setHost(active.host);
        setPort(active.port);
        setHttpEnabled(active.httpEnabled);
        setSocksEnabled(active.socksEnabled);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const onInputChange = (data: FormItemChangeData) => {
    switch (data.name) {
      case 'host':
        setHost(data.value);
        break;
      case 'port':
        setPort(data.value);
        break;
    }
  };

  const onSave = () => {
    const data = { host, port };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(data));
    setSavedHost(host);
    setSavedPort(port);
    showMessage('success', 'Configuration saved successfully');
  };

  const onToggle = async () => {
    if (!host || !port) {
      showMessage('error', 'Please enter host and port');
      return;
    }

    if (!/^\d+$/.test(port)) {
      showMessage('error', 'Port must be a valid number');
      return;
    }

    if (!httpEnabled && !socksEnabled) {
      showMessage('error', 'Please enable at least one proxy type');
      return;
    }

    setLoading(true);
    const result = await window.proxyAPI.toggle(host, port, proxyStatus, httpEnabled, socksEnabled);
    setLoading(false);

    if (result.success) {
      const newStatus = proxyStatus === 'on' ? 'off' : 'on';
      showMessage('success', `Proxy ${newStatus === 'on' ? 'activated' : 'deactivated'}`);
    } else {
      showMessage('error', result.error || 'Failed to toggle proxy');
    }
  };

  // Profile handlers
  const handleSelectProfile = async (profile: Profile) => {
    setActiveProfile(profile);
    setHost(profile.host);
    setPort(profile.port);
    setHttpEnabled(profile.httpEnabled);
    setSocksEnabled(profile.socksEnabled);

    try {
      await window.profileAPI.setActiveProfile(profile.id);
      showMessage('success', `Switched to ${profile.name} profile`);
    } catch (error) {
      showMessage('error', 'Failed to switch profile');
    }
  };

  const handleNewProfile = () => {
    setEditingProfile(null);
    setIsProfileModalOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsProfileModalOpen(true);
  };

  const handleDeleteProfile = (profile: Profile) => {
    setDeletingProfile(profile);
  };

  const confirmDeleteProfile = async () => {
    if (!deletingProfile) return;

    try {
      await window.profileAPI.deleteProfile(deletingProfile.id);
      setProfiles(profiles.filter(p => p.id !== deletingProfile.id));

      if (activeProfile?.id === deletingProfile.id) {
        setActiveProfile(null);
      }

      showMessage('success', 'Profile deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete profile');
    }

    setDeletingProfile(null);
  };

  const handleSaveProfile = async (data: { name: string; host: string; port: string; httpEnabled: boolean; socksEnabled: boolean }) => {
    try {
      let savedProfile: Profile;
      if (editingProfile) {
        savedProfile = await window.profileAPI.updateProfile(editingProfile.id, data);
        setProfiles(profiles.map(p => p.id === editingProfile.id ? savedProfile : p));
        if (activeProfile?.id === editingProfile.id) {
          setActiveProfile(savedProfile);
        }
        showMessage('success', 'Profile updated successfully');
      } else {
        savedProfile = await window.profileAPI.saveProfile(data);
        setProfiles([...profiles, savedProfile]);
        showMessage('success', 'Profile created successfully');
      }
    } catch (error) {
      showMessage('error', editingProfile ? 'Failed to update profile' : 'Failed to create profile');
    }
  };

  const hasChanges = host !== savedHost || port !== savedPort;
  const canTurnOn = host && port && /^\d+$/.test(port) && (httpEnabled || socksEnabled);

  return (
    <div className='h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 flex items-center justify-center p-4 overflow-hidden'>
      {/* 背景装饰 */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl' />
      </div>

      {/* Toast 消息 */}
      {message && (
        <Message
          type={message.type}
          text={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        profile={editingProfile}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProfile}
        onClose={() => setDeletingProfile(null)}
        onConfirm={confirmDeleteProfile}
        profileName={deletingProfile?.name || ''}
      />

      <div className='relative w-full max-w-md'>
        {/* 主卡片 */}
        <div className='relative backdrop-blur-xl bg-gray-900/80 rounded-3xl border border-gray-800/50 shadow-2xl shadow-black/50 overflow-hidden'>
          {/* 顶部渐变条 */}
          <div className='h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-emerald-500' />

          <div className='p-5 space-y-4'>
            {/* 标题区域 */}
            <div className='text-center space-y-1.5'>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border transition-all duration-300 ${proxyStatus === 'on' ? 'border-emerald-500/50 text-emerald-400' : 'border-violet-500/30 text-violet-400'}`}>
                <Icons.Proxy status={proxyStatus} />
              </div>
            </div>

            {/* 状态指示器 */}
            <div className='flex justify-center'>
              <StatusBadge status={proxyStatus} />
            </div>

            {/* 表单区域 */}
            <div className='space-y-2.5'>
              <ProfileSelector
                profiles={profiles}
                activeProfile={activeProfile}
                onSelectProfile={handleSelectProfile}
                onNewProfile={handleNewProfile}
                onEditProfile={handleEditProfile}
                onDeleteProfile={handleDeleteProfile}
                disabled={loading}
              />

              <FormItem
                name='host'
                label='Host'
                value={host}
                onChange={onInputChange}
                onSubmit={onSave}
                placeholder='127.0.0.1'
                disabled={loading}
              />
              <FormItem
                name='port'
                label='Port'
                value={port}
                onChange={onInputChange}
                onSubmit={onSave}
                placeholder='1082'
                disabled={loading}
              />

              {/* 代理类型选择 */}
              <div className='flex gap-4 pt-1'>
                <Checkbox
                  label='HTTP/HTTPS'
                  checked={httpEnabled}
                  onChange={setHttpEnabled}
                  disabled={loading}
                />
                <Checkbox
                  label='SOCKS'
                  checked={socksEnabled}
                  onChange={setSocksEnabled}
                  disabled={loading}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className='space-y-2.5 pt-1'>
              {/* Save 按钮单独一行 */}
              <Button
                onClick={onSave}
                variant='ghost'
                disabled={loading || !hasChanges}
                className={hasChanges ? '' : 'opacity-50'}
                fullWidth
              >
                <Icons.Save />
                Save
              </Button>

              {/* Toggle 按钮 */}
              <Button
                onClick={onToggle}
                variant={proxyStatus === 'on' ? 'danger' : 'success'}
                disabled={loading || (proxyStatus === 'off' && !canTurnOn)}
                loading={loading}
                fullWidth
              >
                {proxyStatus === 'on' ? <Icons.PowerOff /> : <Icons.PowerOn />}
                {loading ? 'Switching...' : (proxyStatus === 'on' ? 'Turn Off' : 'Turn On')}
              </Button>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className='px-5 py-2.5 bg-gray-800/30 border-t border-gray-800/50'>
            <div className='flex items-center justify-between text-[10px] text-gray-500'>
              <span>{host || '-'}:{port || '-'}</span>
              <span className='flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                Ready
              </span>
            </div>
          </div>
        </div>

        {/* 卡片阴影装饰 */}
        <div className='absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-emerald-500/20 rounded-3xl blur-xl -z-10 opacity-50' />
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
