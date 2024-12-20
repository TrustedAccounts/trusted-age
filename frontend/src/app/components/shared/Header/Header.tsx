import React from "react";
import "./Header.scss";
import logo from "../../../../assets/icons/trusted-logo.svg";
import infoBlue from "../../../../assets/icons/info-blue.svg";

export const Header = (): React.JSX.Element => {
  return (
    <header className="Header RowSpaceBetween">
      <img src={logo} className="Logo" alt="logo" />

      <div className="InfoLink Row">
        <img src={infoBlue} alt="info" />
        <a href="#">About Us</a>
      </div>
    </header>
  );
};
