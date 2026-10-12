import React from "react";

const Footer = () => {
  return (
    <div>
      <footer
        className="text-center text-lg-start text-white"
        style={{ backgroundColor: "#087f78" }}
      >

        {/* Copyright */}
        <div
          className="text-center p-3 text-md font-medium"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          © {new Date().getFullYear()} Copyright:{" "}
          <a className="text-white" href="#" style={{textDecoration:'none'}}>
            @Clinicords
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
