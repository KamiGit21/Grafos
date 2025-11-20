import { createRouter, createWebHistory } from 'vue-router';
import homeRoutes from '../features/Home/routes/routes.js';
import JohnsonRoutes from '../features/Johnson/routes/routes.js';
import KruskalRoutes from '../features/Kruskal/routes/routes.js';
import AsignacionRoutes from '../features/Asignacion/routes/routes.js';
import SortsRoutes from '../features/Sorts/routes/routes.js';
import NorthWestRoutes from '../features/NorthWest/routes/routes.js';
import TreesRoutes from '../features/Trees/routes/routes.js'; // ← Agregar esta línea


const routes = [
  ...homeRoutes,
  ...JohnsonRoutes, 
  ...KruskalRoutes,
  ...AsignacionRoutes,
  ...SortsRoutes,
  ...NorthWestRoutes,
  ...TreesRoutes,
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