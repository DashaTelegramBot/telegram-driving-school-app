// src/pages/RoleSelectionPage.tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Line1Svg } from '@/components/svg/Line1Svg';
import { useIsMobile } from '@/hooks/use-mobile';
import { Role } from "@/types";

const RoleSelectionPage = () => {
  const [activeIndex, setActiveIndex] = useState(1); // 0: instructor, 1: student, 2: admin
  const [swipeStartX, setSwipeStartX] = useState(0);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Единое объявление roles с типизацией
  const roles: { 
    id: number; 
    title: string; 
    emoji: string; 
    image: string; 
    description: string; 
    buttonText: string; 
    role: Role;
  }[] = [
    {
      id: 0,
      title: "Инструктор",
      emoji: "🚥",
      image: "/images/car-teacher.png",
      description: "Управление расписанием быстро и эффективно.",
      buttonText: "Продолжить как инструктор",
      role: 'instructor'
    },
    {
      id: 1,
      title: "Ученик",
      emoji: "📚",
      image: "/images/car-student.webp",
      description: "Путь к вождению начинается здесь. Записывайтесь и отслеживайте прогресс в реальном времени.",
      buttonText: "Продолжить как ученик",
      role: 'student'
    },
    {
      id: 2,
      title: "Администратор",
      emoji: "🔎",
      image: "/images/car-admin.png",
      description: "Управление системой и контроль процессов.",
      buttonText: "Продолжить как администратор",
      role: 'admin'
    }
  ];

  // Обработчики свайпа
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeStartX) return;
    
    const currentX = e.touches[0].clientX;
    const diff = swipeStartX - currentX;

    // Минимальная дистанция для свайпа
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeIndex < roles.length - 1) {
        // Свайп влево - следующая карточка (только если не последняя)
        nextCard();
      } else if (diff < 0 && activeIndex > 0) {
        // Свайп вправо - предыдущая карточка (только если не первая)
        prevCard();
      }
      setSwipeStartX(0);
    }
  };

  const handleTouchEnd = () => {
    setSwipeStartX(0);
  };

  const handleContinue = () => {
    const selectedRole: Role = roles[activeIndex].role;
    
    // ИСПРАВЛЕННАЯ СТРОКА - используем searchParams вместо state
    navigate({ 
      to: '/login', 
      search: { role: selectedRole } 
    });
  };

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  const nextCard = useCallback(() => {
    if (activeIndex < roles.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  }, [activeIndex, roles.length]);

  const prevCard = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex]);

  const getCardStyle = (index: number) => {
    const position = index - activeIndex;
    const cardWidth = 208;
    const sideCardWidth = 188;
    const gap = 40; // Расстояние между карточками
    
    if (position === 0) {
      // Active card - центральная карточка
      return {
        width: cardWidth,
        height: 396,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        zIndex: 30,
        opacity: 1
      };
    } else if (position === -1) {
      // Левая карточка - с промежутком от центральной
      return {
        width: sideCardWidth,
        height: 376,
        x: -cardWidth/2 - sideCardWidth/2 - gap/2,
        y: 10,
        scale: 1,
        rotate: -3,
        zIndex: 20,
        opacity: 0.8
      };
    } else if (position === 1) {
      // Правая карточка - с промежутком от центральной
      return {
        width: sideCardWidth,
        height: 376,
        x: cardWidth/2 + sideCardWidth/2 + gap/2,
        y: 10,
        scale: 1,
        rotate: 3,
        zIndex: 20,
        opacity: 0.8
      };
    } else {
      // Остальные карточки - скрыты
      return {
        width: sideCardWidth,
        height: 376,
        x: 0,
        y: 0,
        scale: 0,
        rotate: 0,
        zIndex: 0,
        opacity: 0
      };
    }
  };

  // Функция для получения стилей картинки в зависимости от роли и активности
  const getImageStyle = (roleId: number, isActive: boolean) => {
    if (isActive) {
      switch (roleId) {
        case 0: // Инструктор (активный)
          return {
            width: '284px', 
            height: '125px', 
            marginTop: '67px',
            marginLeft: '-36px' 
          };
        case 1: // Ученик (активный)
          return {
            width: '284px', 
            height: '87px', 
            marginTop: '87px',
            marginLeft: '-36px' 
          };
        case 2: // Администратор (активный) - поднято вверх на 8px
          return {
            width: '276px',
            height: '96px',
            marginTop: '76px', // -8px (было 106px)
            marginLeft: '-32px'
          };
        default:
          return {};
      }
    } else {
      // Боковые карточки 
      switch (roleId) {
        case 0: // Инструктор (боковой)
          return {
            width: '237px', 
            height: '117px', 
            marginTop: '114px',
            marginLeft: '-21px' 
          };
        case 1: // Ученик (боковой) - сдвинуто вниз при активной карточке инструктора или администратора
          return {
            width: '257px', 
            height: '83px', 
            marginTop: activeIndex !== 1 ? '135px' : '135px',
            marginLeft: '-28px' 
          };
        case 2: // Администратор (боковой)
          return {
            width: '250px',
            height: '92px',
            marginTop: '122px',
            marginLeft: '-28px'
          };
        default:
          return {};
      }
    }
  };

  // Функция для получения стилей заголовка в зависимости от роли и активности
  const getTitleStyle = (roleId: number, isActive: boolean) => {
    if (isActive) {
      switch (roleId) {
        case 0: // Инструктор (активный) - поднято вверх на 16px
          return {
            top: '180px', // -16px (было 218px)
            left: '18px',
            right: '85px'
          };
        case 1: // Ученик (активный) - поднято вверх на 8px
          return {
            top: '180px', // -8px (было 204px)
            left: '18px',
            right: '124px'
          };
        case 2: // Администратор (активный) - поднято вверх на 8px
          return {
            top: '180px', // -8px (было 222px)
            left: '18px',
            right: '17px'
          };
        default:
          return {};
      }
    } else {
      // Боковые карточки
      switch (roleId) {
        case 0: // Инструктор (боковой)
          return {
            top: '212px',
            left: '18px',
            right: '85px'
          };
        case 1: // Ученик (боковой) - сдвинуто вниз при активной карточке инструктора или администратора
          return {
            top: activeIndex !== 1 ? '218px' : '218px',
            left: '18px',
            right: '124px'
          };
        case 2: // Администратор (боковой)
          return {
            top: '218px',
            left: '18px',
            right: '18px'
          };
        default:
          return {};
      }
    }
  };

  // Функция для получения стилей описания в зависимости от роли и активности
  const getDescriptionStyle = (roleId: number, isActive: boolean) => {
    // Увеличиваем расстояние между заголовком и текстовым блоком на 8px для всех карточек
    const textBlockTopOffset = 8;

    if (isActive) {
      switch (roleId) {
        case 0: // Инструктор (активный) - поднято вверх на 16px
          return {
            top: '218px', // -16px (было 255px)
            left: '18px',
            right: '18px',
            bottom: '100px'
          };
        case 1: // Ученик (активный) - поднято вверх на 8px
          return {
            top: '220px', // -8px (было 241px)
            left: '18px',
            right: '18px',
            bottom: '168px'
          };
        case 2: // Администратор (активный) - расстояние 8px от заголовка
          return {
            top: '218px', // +8px от заголовка (214px + 29px высоты заголовка ≈ 243px)
            left: '18px',
            right: '18px',
            bottom: '187px'
          };
        default:
          return {};
      }
    } else {
      // Боковые карточки
      switch (roleId) {
        case 0: // Инструктор (боковой)
          return {
            top: '255px',
            left: '18px',
            right: '18px',
            bottom: '100px'
          };
        case 1: // Ученик (боковой) - сдвинуто вниз при активной карточке инструктора или администратора
          return {
            top: activeIndex !== 1 ? '255px' : '255px',
            left: '18px',
            right: '18px',
            bottom: activeIndex !== 1 ? '8px' : '168px'
          };
        case 2: // Администратор (боковой)
          return {
            top: '255px',
            left: '18px',
            right: '18px',
            bottom: '96px'
          };
        default:
          return {};
      }
    }
  };

  // Функция для получения стилей лупы для администратора
  const getMagnifierStyle = (roleId: number, isActive: boolean) => {
    if (roleId !== 2) return {};
    
    if (isActive) {
      // Активная карточка администратора - лупа поднята вверх на 8px
      return {
        top: '265px', // -8px (было 291px)
        left: '18px',
        width: '28px',
        height: '28px'
      };
    } else {
      // Боковая карточка администратора
      return {
        top: '316px',
        left: '18px',
        width: '28px',
        height: '28px'
      };
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#1C1A1B] relative overflow-hidden"
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Background Elements */}
      <div 
        className="absolute w-[450px] h-[650px] bg-[#A56BF5] rounded-full blur-[100px] opacity-45"
        style={{ right: '150px', bottom: '450px' }}
      />
      <div 
        className="absolute w-[450px] h-[650px] bg-[#A56BF5] rounded-full blur-[100px] opacity-25"
        style={{ top: '450px', left: '30px' }}
      />
      <div 
        className="absolute w-[300px] h-[500px] bg-[#C084FC] rounded-full blur-[80px] opacity-30"
        style={{ top: '200px', left: '100px' }}
      />

      {/* Headers Container */}
      <div className="absolute left-4" style={{ top: '12px', width: '493px' }}>
        <h1 className="text-[40px] font-black text-[#EEEEEE] font-inter leading-[44px] whitespace-nowrap overflow-hidden">
          Выберите ваш
        </h1>
      </div>

      {/* Заголовок "профиль" сдвинут вверх - расстояние 0 между заголовками */}
      <div className="absolute left-4 flex items-start justify-between" style={{ top: '56px', width: '229px' }}>
        <h2 
          className="text-[52px] font-bold text-[#EEEEEE] leading-[52px]"
          style={{ 
            fontFamily: '"Caveat", cursive',
            fontWeight: 700 
          }}
        >
          профиль
        </h2>
      </div>

      {/* Line - сдвинуто вправо на 8px и вверх на 1px */}
      <div className="absolute right-[160px] h-[11px]" style={{ top: '107px', left: '-12px' }}>
        <Line1Svg />
      </div>

      {/* Carousel Container с overflow-hidden чтобы скрывать боковые карточки */}
      <div className="absolute top-[140px] bottom-[100px] left-0 right-0 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {roles.map((role, index) => {
              const isActive = index === activeIndex;
              const imageStyle = getImageStyle(role.id, isActive);
              const titleStyle = getTitleStyle(role.id, isActive);
              const descriptionStyle = getDescriptionStyle(role.id, isActive);
              const magnifierStyle = getMagnifierStyle(role.id, isActive);
              
              return (
                <motion.div
                  key={role.id}
                  className="absolute cursor-pointer"
                  initial={getCardStyle(index)}
                  animate={getCardStyle(index)}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 22,
                    mass: 0.7,
                    duration: 0.6
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <Card className="w-full h-full bg-[#695E5E] bg-opacity-20 backdrop-blur-md rounded-2xl border-0 overflow-visible">
                    <CardContent className="p-0 h-full relative">
                      {/* Изображение с плавной анимацией */}
                      <motion.div 
                        className="absolute w-full flex justify-center overflow-visible"
                        initial={false}
                        animate={{
                          width: imageStyle.width,
                          height: imageStyle.height,
                          marginTop: imageStyle.marginTop,
                          marginLeft: imageStyle.marginLeft
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 25,
                          duration: 0.5
                        }}
                      >
                        <img 
                          src={role.image} 
                          alt={role.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </motion.div>

                      {/* Role Title and Emoji */}
                      <motion.div 
                        className="absolute flex items-center justify-between"
                        initial={false}
                        animate={{
                          top: titleStyle.top,
                          left: titleStyle.left,
                          right: titleStyle.right
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 25,
                          duration: 0.5
                        }}
                      >
                        <h3 className="text-[20px] font-bold text-[#EEEEEE] font-inter">
                          {role.title}
                        </h3>
                        {role.emoji && role.id !== 2 && (
                          <span className="text-[20px] ml-1 relative top-[3px]">
                            {role.emoji}
                          </span>
                        )}
                      </motion.div>

                      {/* Magnifier for Admin - positioned separately */}
                      {role.id === 2 && (
                        <motion.div 
                          className="absolute flex items-center justify-center text-[20px]"
                          initial={false}
                          animate={{
                            top: magnifierStyle.top,
                            left: magnifierStyle.left,
                            width: magnifierStyle.width,
                            height: magnifierStyle.height
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 25,
                            duration: 0.5
                          }}
                        >
                          {role.emoji}
                        </motion.div>
                      )}

                      {/* Role Description */}
                      <motion.div 
                        className="absolute"
                        initial={false}
                        animate={{
                          top: descriptionStyle.top,
                          left: descriptionStyle.left,
                          right: descriptionStyle.right,
                          bottom: descriptionStyle.bottom
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 25,
                          duration: 0.5
                        }}
                      >
                        <p className="text-[14px] font-medium text-[#B5B1B5] font-inter leading-tight">
                          {role.description}
                        </p>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Continue Button */}
      <div className="absolute bottom-2 left-0 right-0 p-4 flex justify-center">
        <Button
          className="w-full max-w-[360px] h-[56px] rounded-[40px] bg-[#9B5DE5] hover:bg-[#8B4DD5] text-[16px] font-bold text-[#EEEEEE] font-inter flex items-center justify-center relative mx-4"
          onClick={handleContinue}
        >
          <span className="relative -top-[1px] text-center px-2">
            {roles[activeIndex].buttonText}
          </span>
        </Button>
      </div>

      {/* Keyboard Navigation for Desktop */}
      {!isMobile && (
        <div className="absolute top-2 right-4 flex gap-2">
          <button
            onClick={prevCard}
            disabled={activeIndex === 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
              activeIndex === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#9B5DE5]'
            }`}
          >
            ←
          </button>
          <button
            onClick={nextCard}
            disabled={activeIndex === roles.length - 1}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
              activeIndex === roles.length - 1 ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#9B5DE5]'
            }`}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleSelectionPage;