// src/routes/routeTree.ts
import { Route } from '@tanstack/react-router'
import { RootRoute } from './__root'
import { IndexRoute } from './index'
import { LoginRoute } from './login'
import { AdminRoute } from './admin'
import { DashboardRoute } from './dashboard'
import { InstructorRoute } from './instructor'
import { StudentRoute } from './student'
import { NotFoundRoute } from './__not-found'

// Объединяем все маршруты в дерево
export const routeTree = RootRoute.addChildren([
  IndexRoute,
  LoginRoute,
  AdminRoute,
  DashboardRoute,
  InstructorRoute,
  StudentRoute,
  NotFoundRoute,
])

// Экспортируем тип для использования в TypeScript
export type RouteTree = typeof routeTree