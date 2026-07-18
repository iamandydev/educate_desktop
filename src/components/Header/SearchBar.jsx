import { Search } from "lucide-react";

import "./SearchBar.css";

export default function SearchBar() {
  return (
    <div className="search-bar">
      <Search size={18} color="#999" />
      <input type="text" placeholder="Search courses, events..." />
    </div>
  );
}
