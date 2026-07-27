import React, { useState, useRef, useEffect, useId, useLayoutEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  direction = 'auto', // 'auto' | 'up' | 'down'
  renderOption,
  renderSelected,
  icon: LeftIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [placementUp, setPlacementUp] = useState(false);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownId = useId();

  // Smart multi-field search logic
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();

    if (typeof opt === 'string') {
      return opt.toLowerCase().includes(term);
    }

    // Check multiple properties on rich options (name, label, title, owner, status, member names, etc.)
    const nameMatch = (opt.name || opt.label || opt.title || '').toLowerCase().includes(term);
    const statusMatch = (opt.status || '').toLowerCase().includes(term);
    const ownerMatch = typeof opt.owner === 'string'
      ? opt.owner.toLowerCase().includes(term)
      : (opt.owner?.fullName || opt.ownerName || '').toLowerCase().includes(term);

    const membersMatch = Array.isArray(opt.members)
      ? opt.members.some((m) => {
          const name = typeof m === 'string' ? m : m.user?.fullName || m.fullName || '';
          return name.toLowerCase().includes(term);
        })
      : false;

    return nameMatch || statusMatch || ownerMatch || membersMatch;
  });

  const selectedOption = options.find((opt) => {
    if (typeof opt === 'string') return opt === value;
    return opt.value === value || opt._id === value || opt.id === value;
  });

  // Calculate viewport and container collisions to decide if dropdown should open upward
  const checkPosition = () => {
    if (!containerRef.current) return;
    if (direction === 'up') {
      setPlacementUp(true);
      return;
    }
    if (direction === 'down') {
      setPlacementUp(false);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedDropdownHeight = 300; // estimated max height of menu

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If space below is insufficient AND space above is larger, open upward
    if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
      setPlacementUp(true);
    } else {
      setPlacementUp(false);
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      checkPosition();
    }
  }, [isOpen]);

  // Recalculate position on window resize or scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      checkPosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (isOpen) {
      setHighlightedIndex(0);
    } else {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  const handleSelect = (opt) => {
    const optValue = typeof opt === 'string' ? opt : opt.value !== undefined ? opt.value : opt._id || opt.id;
    onChange(optValue, opt);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    }
  };

  const getLabel = (opt) => {
    if (!opt) return placeholder;
    if (typeof opt === 'string') return opt;
    return opt.label || opt.name || opt.title || placeholder;
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {LeftIcon && <LeftIcon className="w-4 h-4 text-gray-400 shrink-0" />}
          {renderSelected && selectedOption ? (
            renderSelected(selectedOption)
          ) : (
            <span className={`truncate ${!selectedOption ? 'text-gray-400 font-normal' : 'text-gray-900 font-semibold'}`}>
              {getLabel(selectedOption)}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={dropdownId}
          role="listbox"
          className={`absolute left-0 right-0 z-[100] bg-white border border-gray-200/90 rounded-2xl shadow-2xl max-h-80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            placementUp ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
          } ${dropdownClassName}`}
        >
          {/* Search Bar */}
          {searchable && (
            <div className="p-2.5 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto p-2 space-y-1 max-h-72 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-xs text-center text-gray-400 font-medium">
                No matching projects found
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const optValue =
                  typeof opt === 'string' ? opt : opt.value !== undefined ? opt.value : opt._id || opt.id;
                const isSelected =
                  typeof selectedOption === 'string'
                    ? selectedOption === optValue
                    : selectedOption && (selectedOption.value === optValue || selectedOption._id === optValue || selectedOption.id === optValue);

                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={optValue || index}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 font-semibold border border-indigo-100'
                        : isHighlighted
                        ? 'bg-gray-100/90 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                      {renderOption ? (
                        renderOption(opt, isSelected)
                      ) : (
                        <span className="truncate">{getLabel(opt)}</span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
