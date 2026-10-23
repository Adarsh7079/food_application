import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContextContext";
import { assets } from "../assets/assets";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  return showSearch ? (
    <div className="border-t border-b border-gray-300  bg-gray-50 text-center">
      <div className="inline-flex items-center justify-center border border-gray-300 px-5 py-2 my-5 mx-3 rounded-full">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 w-120 outline-none bg-inherit text-sm"
          type="text"
          placeholder="Search"
        />
        <img className="w-4" src={assets.search_icon} alt="" />
      </div>
      <img
        onClick={() => setShowSearch(false)}
        className="inline w-3 cursor-pointer"
        src={assets.cross_icon}
        alt=""
      />
    </div>
  ) : null;
};

export default SearchBar;
