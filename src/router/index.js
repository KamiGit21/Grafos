import { createRouter, createWebHistory } from 'vue-router';
import homeRoutes from '../features/Home/routes/routes.js';
import JohnsonRoutes from '../features/Johnson/routes/routes.js';
import AsignacionRoutes from '../features/Asignacion/routes/routes.js';
import SortsRoutes from '../features/Sorts/routes/routes.js';
import NorthWestRoutes from '../features/NorthWest/routes/routes.js';
import TreesRoutes from '../features/Trees/routes/routes.js'; // ← Agregar esta línea
<<<<<<< HEAD
=======

>>>>>>> origin/Santi_branch_2.0

const routes = [
  ...homeRoutes,
  ...JohnsonRoutes, 
  ...AsignacionRoutes,
  ...SortsRoutes,
  ...NorthWestRoutes,
<<<<<<< HEAD
  ...TreesRoutes, // ← Agregar esta línea
=======
  ...TreesRoutes,
>>>>>>> origin/Santi_branch_2.0
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