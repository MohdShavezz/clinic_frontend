import React, { lazy, Suspense } from 'react';
import CircularLoader from '../../custom/CircularLoader';
const MainPage = lazy(() => import('../../components/main_page/MainPage'));

const Home = () => {
  return (
    <Suspense fallback={<CircularLoader />}>
      <MainPage />
    </Suspense>
  );
};

export default Home;
