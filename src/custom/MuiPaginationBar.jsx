import React, { useState, useEffect } from "react";
import { Pagination, PaginationItem } from "@mui/material";
import { styled } from "@mui/material/styles";

const CustomPagination = styled(Pagination)({
  "& .MuiPaginationItem-root": {
    color: "#333", // Default text color
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
    "&.Mui-selected": {
      backgroundColor: "#4f46e5", // Selected page color
      color: "#fff",
      "&:hover": {
        backgroundColor: "#4338ca", // Hover color for selected page
      },
    },
  },
});

const MuiPaginationBar = ({currentPage,setCurrentPage,totalPages}) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 600); // Adjust breakpoint as needed
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
      <CustomPagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        siblingCount={isSmallScreen ? 0 : 1} // Fewer sibling pages on small screens
        boundaryCount={isSmallScreen ? 1 : 2} // Fewer boundary pages on small screens
        shape="rounded"
        renderItem={(item) => <PaginationItem {...item} disableRipple />}
      />
    </div>
  );
};

export default MuiPaginationBar;
