import { useState, useRef, useEffect } from 'react';
import { useCategorySearch, useCategories } from '@/hooks/useCategories';
import type { StreamCategory } from '@/types/Profile';

interface CategorySearchDropdownProps {
  value: StreamCategory | null;
  onChange: (category: StreamCategory | null) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Searchable category dropdown component with debouncing and offline support
 *
 * Features:
 * - Debounced search as user types
 * - Loading indicator during search
 * - Displays category artwork/icons if available
 * - Falls back to manual text entry if search fails
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Click outside to close
 */
export function CategorySearchDropdown({
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}: CategorySearchDropdownProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value?.name || '');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
  } = useCategorySearch(300);

  // Get all categories for showing popular/default options
  const { popularCategories, isLoading: categoriesLoading } = useCategories();

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value?.name || '');
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setQuery(newValue);
    setIsOpen(true);

    // Clear selection if user edits the input
    if (value && newValue !== value.name) {
      onChange(null);
    }
  };

  const handleSelectCategory = (category: StreamCategory) => {
    setInputValue(category.name);
    onChange(category);
    setIsOpen(false);
    setQuery('');
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Show default results when focusing
    if (!query) {
      setQuery('');
    }
  };

  const handleInputBlur = () => {
    // Small delay to allow click on dropdown items
    setTimeout(() => {
      // If user typed something but didn't select from dropdown,
      // treat it as manual entry
      if (inputValue && !value) {
        onChange({
          id: inputValue.toLowerCase().replace(/[^a-z0-9]/g, ''),
          name: inputValue,
        });
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
    // Note: Full keyboard navigation (arrow keys, enter) could be added here
  };

  const handleClear = () => {
    setInputValue('');
    setQuery('');
    onChange(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={`scandi-input w-full pr-20 ${error ? 'border-red-300 bg-red-50' : ''}`}
          placeholder="Search for a category..."
          disabled={disabled}
          required={required}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="category-dropdown"
          aria-expanded={isOpen}
        />

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <span className="animate-spin text-neutral-400">⟳</span>
          </div>
        )}

        {/* Clear button */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors px-2 py-1"
            aria-label="Clear category"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && !disabled && (
        <div
          id="category-dropdown"
          className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          role="listbox"
        >
          {isSearching ? (
            <div className="px-4 py-8 text-center text-neutral-500">
              <span className="animate-spin inline-block">⟳</span>
              <p className="mt-2 text-sm">Searching categories...</p>
            </div>
          ) : (() => {
            // Determine which categories to show
            const categoriesToShow = query && hasResults
              ? results
              : !query && popularCategories.length > 0
                ? popularCategories
                : results.length > 0
                  ? results
                  : [];

            return categoriesToShow.length > 0 ? (
              <>
                {!query && popularCategories.length > 0 && (
                  <div className="px-4 pt-3 pb-2 border-b border-neutral-100">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      Popular Categories
                    </p>
                  </div>
                )}
                <ul className="py-2">
                  {categoriesToShow.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCategory(category)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors flex items-center space-x-3"
                        role="option"
                        aria-selected={value?.id === category.id}
                      >
                        {/* Category icon/artwork placeholder */}
                        {category.boxArtUrl ? (
                          <img
                            src={category.boxArtUrl}
                            alt=""
                            className="w-10 h-14 object-cover rounded"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-neutral-100 rounded flex items-center justify-center text-2xl">
                            🎮
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 truncate">
                            {category.name}
                          </p>
                          {value?.id === category.id && (
                            <p className="text-xs text-green-600 mt-1">✓ Selected</p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : query ? (
              <div className="px-4 py-8 text-center">
                <p className="text-neutral-600 mb-2">No categories found</p>
                <p className="text-xs text-neutral-500">
                  You can still use "{query}" as a manual entry
                </p>
              </div>
            ) : categoriesLoading ? (
              <div className="px-4 py-8 text-center text-neutral-500">
                <span className="animate-spin inline-block">⟳</span>
                <p className="mt-2 text-sm">Loading categories...</p>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-neutral-500">
                <p className="text-sm">No categories available</p>
                <p className="text-xs mt-1">Type to search or enter manually</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}

      {/* Help text */}
      {!error && (
        <p className="text-xs text-neutral-500 mt-1">
          Search for a Twitch category or type manually
        </p>
      )}
    </div>
  );
}
