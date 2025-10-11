'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneInput = PhoneInput;
var react_1 = require("react");
var react_aria_components_1 = require("react-aria-components");
var Input_1 = require("./Input");
var formStyles_1 = require("../styles/formStyles");
var InputLabel_1 = require("../common/InputLabel");
var InputDescription_1 = require("../common/InputDescription");
var InputError_1 = require("../common/InputError");
var PhoneInputCountryCodes_1 = require("./PhoneInputCountryCodes");
// Basic phone validation rules
var PHONE_VALIDATION_RULES = {
    '+47': { exact: 8, message: 'Norwegian phone numbers must be exactly 8 digits' },
    '+46': { min: 7, max: 13, message: 'Swedish phone numbers must be 7 to 13 digits' },
    '+45': { exact: 8, message: 'Danish phone numbers must be exactly 8 digits' },
};
// Memoized country item component to prevent unnecessary re-renders
var CountryItem = react_1.default.memo(function (_a) {
    var country = _a.country, stableId = _a.stableId;
    return (<react_aria_components_1.ListBoxItem key={stableId} id={stableId} textValue={"".concat(country.flag, " ").concat(country.code, " ").concat(country.name)} className={formStyles_1.componentStyles.listBoxItem}>
    <span className="text-lg mr-2">{country.flag}</span>
    <span className={formStyles_1.textStyles.listBoxItemPrimary}>{country.code}</span>
    <span className={"".concat(formStyles_1.textStyles.listBoxItemSecondary, " ml-2")}>{country.name}</span>
  </react_aria_components_1.ListBoxItem>);
});
CountryItem.displayName = 'CountryItem';
function PhoneInput(_a) {
    var _b;
    var _c, _d;
    var _e = _a.name, name = _e === void 0 ? 'phone' : _e, _f = _a.label, label = _f === void 0 ? 'Phone Number' : _f, description = _a.description, _g = _a.defaultCode, defaultCode = _g === void 0 ? '+47' : _g, _h = _a.countries, countries = _h === void 0 ? PhoneInputCountryCodes_1.COUNTRY_CODES : _h, value = _a.value, errors = _a.errors, disabled = _a.disabled, onChange = _a.onChange;
    // Memoize default country calculation
    var defaultCountry = (0, react_1.useMemo)(function () { return countries.find(function (c) { return c.code === defaultCode; }) || countries[0] || { name: '', code: '', flag: '' }; }, [countries, defaultCode]);
    var _j = (0, react_1.useState)(defaultCountry), country = _j[0], setCountry = _j[1];
    var _k = (0, react_1.useState)(''), localNumber = _k[0], setLocalNumber = _k[1];
    var _l = (0, react_1.useState)(''), comboInputValue = _l[0], setComboInputValue = _l[1];
    var _m = (0, react_1.useState)(null), localError = _m[0], setLocalError = _m[1];
    // Memoize emit change function
    var emitChange = (0, react_1.useCallback)(function (selectedCountry, number) {
        var fullNumber = selectedCountry ? "".concat(selectedCountry.code).concat(number) : number;
        onChange === null || onChange === void 0 ? void 0 : onChange({
            fullNumber: fullNumber,
            localNumber: number,
            country: selectedCountry,
        });
    }, [onChange]);
    // Parse incoming value
    (0, react_1.useEffect)(function () {
        if (!value) {
            setLocalNumber('');
            return;
        }
        var matchedCountry = countries.find(function (c) { return value.startsWith(c.code); });
        if (matchedCountry) {
            setCountry(matchedCountry);
            setLocalNumber(value.slice(matchedCountry.code.length));
        }
        else {
            setCountry(defaultCountry);
            setLocalNumber(value.replace(/^\+/, ''));
        }
    }, [value, countries, defaultCountry]);
    // Update ComboBox input value when country changes
    (0, react_1.useEffect)(function () {
        setComboInputValue(country.code);
    }, [country]);
    // Change handlers
    var handleNumberChange = (0, react_1.useCallback)(function (e) {
        var cleaned = e.target.value.replace(/\D/g, '');
        setLocalNumber(cleaned);
        setLocalError(null);
        emitChange(country, cleaned);
    }, [country, emitChange]);
    var handleNumberBlur = (0, react_1.useCallback)(function () {
        if (!localNumber) {
            setLocalError(null);
            return;
        }
        var rule = PHONE_VALIDATION_RULES[country.code];
        var error = null;
        if (rule) {
            if (rule.exact !== undefined && localNumber.length !== rule.exact) {
                error = rule.message;
            }
            else if ((rule.min !== undefined && localNumber.length < rule.min) ||
                (rule.max !== undefined && localNumber.length > rule.max)) {
                error = rule.message;
            }
        }
        else {
            // Generic validation
            if (localNumber.length < 6) {
                error = 'Phone number must be at least 6 digits';
            }
            else if (localNumber.length > 15) {
                error = 'Phone number must be at most 15 digits';
            }
        }
        setLocalError(error);
    }, [country.code, localNumber]);
    var handleCountryChange = (0, react_1.useCallback)(function (key) {
        if (!key || key === 'no-results') {
            emitChange(null, localNumber);
            return;
        }
        // Parse stable ID format: "code:country_name"
        var keyStr = String(key);
        var _a = keyStr.split(':'), code = _a[0], encodedName = _a[1];
        var name = encodedName === null || encodedName === void 0 ? void 0 : encodedName.replace(/_/g, ' ');
        var selectedCountry = countries.find(function (c) { return c.code === code && c.name === name; }) || null;
        if (selectedCountry) {
            setCountry(selectedCountry);
        }
        emitChange(selectedCountry, localNumber);
    }, [countries, emitChange, localNumber]);
    var handleInputChange = (0, react_1.useCallback)(function (val) {
        // Allow free typing for filtering; we reset later if needed
        setComboInputValue(val);
    }, []);
    var handleOpenChange = (0, react_1.useCallback)(function (isOpen) {
        if (!isOpen) {
            // When dropdown closes, reset to show only country code
            setComboInputValue(country.code);
        }
    }, [country]);
    // --- NEW: helper to commit typed codes like "+47" or "47" ---
    var commitTypedCountryCode = (0, react_1.useCallback)(function (raw) {
        var typed = raw.trim();
        if (!typed)
            return false;
        // Normalize "47" -> "+47"
        var normalized = typed.startsWith('+') ? typed : "+".concat(typed);
        var matched = countries.find(function (c) { return c.code.toLowerCase() === normalized.toLowerCase(); });
        if (matched) {
            if (matched.code !== country.code) {
                setCountry(matched);
                emitChange(matched, localNumber);
            }
            // Ensure input shows the canonical code
            setComboInputValue(matched.code);
            return true;
        }
        return false;
    }, [countries, country.code, emitChange, localNumber]);
    // Commit on blur; otherwise snap back to current code
    var handleInputBlur = (0, react_1.useCallback)(function () {
        if (!commitTypedCountryCode(comboInputValue)) {
            setComboInputValue(country.code);
        }
    }, [commitTypedCountryCode, comboInputValue, country.code]);
    // Filter countries list based on typed query
    var filteredCountries = (0, react_1.useMemo)(function () {
        var query = comboInputValue.trim().toLowerCase();
        if (!query || query === country.code.toLowerCase()) {
            return countries;
        }
        return countries.filter(function (c) { return c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query); });
    }, [countries, comboInputValue, country.code]);
    // Stable selected key for ComboBox
    var selectedKey = (0, react_1.useMemo)(function () {
        return country.code && country.name ? "".concat(country.code, ":").concat(country.name.replace(/\s+/g, '_')) : null;
    }, [country.code, country.name]);
    // Render countries
    var renderedCountries = (0, react_1.useMemo)(function () {
        return filteredCountries.map(function (countryItem) {
            var stableId = "".concat(countryItem.code, ":").concat(countryItem.name.replace(/\s+/g, '_'));
            return <CountryItem key={stableId} country={countryItem} stableId={stableId}/>;
        });
    }, [filteredCountries]);
    return (<div className={formStyles_1.formStyles.inputWrapper}>
      {label && <InputLabel_1.InputLabel>{label}</InputLabel_1.InputLabel>}
      {description && <InputDescription_1.InputDescription>{description}</InputDescription_1.InputDescription>}

      <div className={"".concat(formStyles_1.componentStyles.phoneInputContainer, " flex items-stretch")}>
        {/* Country Selector */}
        <react_aria_components_1.ComboBox selectedKey={selectedKey} inputValue={comboInputValue} onSelectionChange={handleCountryChange} onInputChange={handleInputChange} onOpenChange={handleOpenChange} className={"".concat(formStyles_1.componentStyles.integratedComboBoxContainer, " min-w-16 max-w-24")} allowsCustomValue={false} isDisabled={disabled} aria-label="Select country code" menuTrigger="input">
          <div className={formStyles_1.componentStyles.comboBoxInputWrapper}>
            <react_aria_components_1.Input className={formStyles_1.componentStyles.comboBoxInputField} placeholder="Select country" onBlur={handleInputBlur} onKeyDown={function (e) {
            // Commit typed code on Tab or Enter before focus leaves/selection changes
            if (e.key === 'Tab' || e.key === 'Enter') {
                var val = e.target.value;
                commitTypedCountryCode(val);
                // Do not prevent default; we just ensure state is updated in time.
            }
        }}/>
            <react_aria_components_1.Button className={"px-2 ".concat(formStyles_1.textStyles.dropdownButton)}>▾</react_aria_components_1.Button>
          </div>

          <react_aria_components_1.Popover className={"".concat(formStyles_1.componentStyles.popover, " max-h-60 overflow-hidden")}>
            <react_aria_components_1.ListBox className="max-h-60 overflow-y-auto">
              {renderedCountries}
              {filteredCountries.length === 0 && (<react_aria_components_1.ListBoxItem id="no-results" textValue="No countries found" className={"px-3 py-2 ".concat(formStyles_1.textStyles.emptyStateText)} isDisabled>
                  No countries found
                </react_aria_components_1.ListBoxItem>)}
            </react_aria_components_1.ListBox>
          </react_aria_components_1.Popover>
        </react_aria_components_1.ComboBox>

        {/* Phone Number Input */}
        <Input_1.Input name={name} type="tel" inputMode="numeric" pattern="[0-9]*" value={localNumber} onChange={handleNumberChange} onBlur={handleNumberBlur} disabled={disabled} placeholder="Enter phone number" className="p-2 bg-gray-50 dark:bg-gray-900 border-0 rounded-none focus:ring-0 flex-1 w-full" noWrapper/>
      </div>

      {/* Error Display */}
      {(localError || ((_c = errors === null || errors === void 0 ? void 0 : errors[name]) === null || _c === void 0 ? void 0 : _c.message)) && (<InputError_1.InputError errors={_b = {}, _b[name] = { message: localError || ((_d = errors === null || errors === void 0 ? void 0 : errors[name]) === null || _d === void 0 ? void 0 : _d.message) || '' }, _b} name={name}/>)}
    </div>);
}
