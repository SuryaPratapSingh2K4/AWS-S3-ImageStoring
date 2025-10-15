import React from "react";
import { Link } from "react-router-dom";

function Navbar() {


    return (
        <nav className="bg-base-300 px-4 py-3 shadow-md w-full">
            <div className="flex items-center justify-center gap-4 flex-nowrap">
                {/* Logo / Title */}
                <Link to="/postcollection" className="text-xl px-3 font-bold text-white flex-shrink-0">
                    Post Collections
                </Link>
                <Link to='/newpost' className="text-xl px-3 font-bold text-white flex-shrink-0">
                    NewPost
                </Link>

            </div>
        </nav>
    );
}

export default Navbar;
