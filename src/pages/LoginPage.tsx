import React, { useState, useEffect } from 'react';
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Role } from "@/types";

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor' | 'admin'>('student');

useEffect(() => {
  const savedRole = localStorage.getItem('selectedRole');
  if (savedRole && ['student', 'instructor', 'admin'].includes(savedRole)) {
    setSelectedRole(savedRole as Role);
  } else {
    navigate({ to: '/' });
  }
}, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 11) {
      toast.error('Номер телефона должен содержать 11 цифр');
      return;
    }
    
    try {
      await login(cleanPhone, formData.password, selectedRole);
      // После успешного входа перенаправляем на соответствующий дашборд
      switch(selectedRole) {
        case 'student':
          navigate({ to: '/student'});
          break;
        case 'instructor':
          navigate({ to: '/instructor'});
          break;
        case 'admin':
          navigate({ to: '/admin'});
          break;
        default:
          navigate({ to: '/dashboard'});
      }
    } catch (error) {
      // Ошибка обрабатывается в AuthContext
    }
  };

  const handleBack = () => {
    // Очищаем выбранную роль и возвращаемся на выбор роли
    localStorage.removeItem('selectedRole');
    navigate({ to: '/' });
  };

  const getRoleDisplayName = () => {
    switch (selectedRole) {
      case 'student': return 'ученик';
      case 'instructor': return 'инструктор';
      case 'admin': return 'администратор';
      default: return 'ученик';
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1A1B] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Circles */}
      <div className="absolute w-[450px] h-[650px] bg-[#A56BF5] rounded-full blur-[100px] opacity-45 -top-32 -right-32" />
      <div className="absolute w-[450px] h-[650px] bg-[#A56BF5] rounded-full blur-[100px] opacity-25 -bottom-32 -left-32" />
      <div className="absolute w-[300px] h-[500px] bg-[#C084FC] rounded-full blur-[80px] opacity-30 top-1/4 left-1/4" />
      
      {/* Back Button */}
      <button 
        onClick={handleBack}
        className="absolute top-4 left-4 text-[#EEEEEE] text-base font-medium underline font-inter flex items-center z-10 hover:opacity-80 transition-opacity"
        data-testid="button-back"
      >
        &lt; Изменить профиль
      </button>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#695E5E] bg-opacity-20 backdrop-blur-md rounded-[28px] border-0 p-6 sm:p-8 mb-6">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl text-[#EEEEEE] font-black font-inter text-center mb-8" data-testid="text-title">
          Вход
        </h1>

        {/* Role Display */}
        <div className="text-center mb-6">
          <span className="text-[#EEEEEE] font-inter font-medium">
            Вы входите как: <span className="font-bold capitalize">{getRoleDisplayName()}</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Phone Input */}
          <div className="mb-6">
            <Label 
              htmlFor="phone"
              className="block text-[#EEEEEE] font-bold font-inter mb-3 text-sm sm:text-base"
            >
              Номер телефона
            </Label>
            <div className="relative bg-[#695E5E] bg-opacity-20 backdrop-blur-md rounded-2xl h-14 flex sm:h-16 flex items-center px-4">
              <span className="text-[#B5B1B5] font-inter font-medium text-lg sm:text-xl mr-3">
                ☎️
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 888-77-66"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="flex-1 bg-transparent border-0 text-[#EEEEEE] font-inter font-medium placeholder:text-[#B5B1B5] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base"
                required
                data-testid="input-phone"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <Label 
              htmlFor="password"
              className="block text-[#EEEEEE] font-bold font-inter mb-3 text-sm sm:text-base"
            >
              Пароль
            </Label>
            <div className="relative bg-[#695E5E] bg-opacity-20 backdrop-blur-md rounded-2xl h-14 sm:h-16 flex items-center px-4">
              <span className="text-[#B5B1B5] font-inter font-medium text-lg sm:text-xl mr-3">
                🔒
              </span>
              <Input
                id="password"
                type={(isPasswordFocused || showPassword) ? "text" : "password"}
                placeholder="Введите ваш пароль"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="flex-1 bg-transparent border-0 text-[#EEEEEE] font-inter font-medium placeholder:text-[#B5B1B5] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 pr-10 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base"
                required
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`transition-colors ${
                  showPassword ? 'text-[#EEEEEE]' : 'text-[#B5B1B5]'
                }`}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
             </div>
            </div>  

          {/* Forgot Password Link */}
          <button
            type="button"
            className="block mx-auto text-[#EEEEEE] font-medium underline font-inter mb-6 text-lg hover:opacity-80 transition-opacity"
            onClick={() => toast.info('Обратитесь к администратору для восстановления доступа')}
            data-testid="button-forgot-password"
          >
            Не могу войти
          </button>

      {/* Submit Button - moved outside the card */}
      <div className="w-full px-4 sm:px-0 self-center">
        <Button 
          type="submit"
          className="w-full max-w-[360px] h-[56px] rounded-[40px] bg-[#9B5DE5] hover:bg-[#8B4DD5] text-[16px] font-bold text-[#EEEEEE] font-inter transition-colors mx-auto"
          disabled={loading}
        >
          {loading ? 'Вход...' : `Войти как ${getRoleDisplayName()}`}
        </Button>
      </div>
      </form>
    </div>
   </div> 
  );
};

export default LoginPage;