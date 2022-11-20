import { useSelector } from "react-redux";

import logo from "../assets/logo.svg";

const Navbar = () => {
  const account = useSelector((state) => state.provider.account);

  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img
          src={logo}
          className="logo"
          alt="Knight Logo"
          style={{ backgroundColor: "white", borderRadius: "15px" }}
        ></img>
        <h1>Knight Finance</h1>
      </div>

      <div className="exchange__header--networks flex"></div>

      <div className="exchange__header--account flex">
        {account ? (
          <a href="#">{account.slice(0, 5) + "..." + account.slice(38, 42)}</a>
        ) : (
          <a href="#">{account}</a>
        )}
      </div>
    </div>
  );
};

export default Navbar;
