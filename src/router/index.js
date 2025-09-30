import { createRouter, createWebHistory } from 'vue-router';
import homeRoutes from '../features/Home/routes/routes.js';
import JohnsonRoutes from '../features/Johnson/routes/routes.js';
import AsignacionRoutes from '../features/Asignacion/routes/routes.js';

const routes = [
  ...homeRoutes,
  ...JohnsonRoutes, 
  ...AsignacionRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../components/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;