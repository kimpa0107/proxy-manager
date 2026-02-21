import { useEffect, useState } from 'react';

const CONFIG_KEY = '_PA_PROXY_';

interface IConfig {
  host: string;
  port: string;
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
  Proxy: () => (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
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
  const isOn = status === 'on';

  return (
    <div className='flex items-center gap-2'>
      <div className='relative flex items-center justify-center'>
        <div className={`
          w-2 h-2 rounded-full transition-colors duration-300
          ${isOn ? 'bg-emerald-400' : 'bg-gray-500'}
        `} />
        {isOn && (
          <div className='absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping' />
        )}
      </div>
      <span className={`text-xs font-medium ${isOn ? 'text-emerald-400' : 'text-gray-400'}`}>
        {isOn ? 'Proxy Active' : 'Proxy Off'}
      </span>
    </div>
  );
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

  const getConfig = (): IConfig | null => {
    const data = localStorage.getItem(CONFIG_KEY);
    if (!data) return null;
    return JSON.parse(data);
  };

  useEffect(() => {
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

      <div className='relative w-full max-w-md'>
        {/* 主卡片 */}
        <div className='relative backdrop-blur-xl bg-gray-900/80 rounded-3xl border border-gray-800/50 shadow-2xl shadow-black/50 overflow-hidden'>
          {/* 顶部渐变条 */}
          <div className='h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-emerald-500' />
          
          <div className='p-5 space-y-4'>
            {/* 标题区域 */}
            <div className='text-center space-y-1.5'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-400'>
                <Icons.Proxy />
              </div>
            </div>

            {/* 状态指示器 */}
            <div className='flex justify-center'>
              <StatusBadge status={proxyStatus} />
            </div>

            {/* 表单区域 */}
            <div className='space-y-2.5'>
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
                placeholder='1080'
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
