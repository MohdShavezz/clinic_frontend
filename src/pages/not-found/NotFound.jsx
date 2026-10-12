import React from 'react';

const NotFound = () => {
  return (
    <div className="grid content-center h-screen bg-gray-100">
      <div className="text-center mt-[-40px]">
        <img src="../../../../public/404.jpg" alt="notfound" className='w-40 sm:w-60 lg:w-77 mx-auto rounded-lg' />
        {/* <h1 className="text-6xl font-bold text-gray-800">404</h1> */}
        <p className="text-2xl text-gray-600 mt-2">Page Not Found</p>
        <p className="mt-1 text-gray-500">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <a
          href="/"
          className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
