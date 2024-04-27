import { IconChevronDown } from "@tabler/icons-react";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import { DATA_TEST_ID } from "@eventuras/utils";
import {
  Button as AriaButton,
  Select as AriaSelect,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue
} from "react-aria-components";

export type SelectProps = {
  label?: string;
  name: string;
  options: { value: string; label: string }[];
  [DATA_TEST_ID]?: string;
};

const styles = {
  wrapper: "w-full",
  button: {
    base:
      "w-full flex bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 text-left",
    icon: "justify-items-end h-5 w-5 text-violet-200 hover:text-violet-100",
  },
  options:
    "relative inline-block justify-center mt-1 max-h-60 w-full overflow-auto bg-white dark:bg-gray-800 shadow-lg text-black dark:text-white py-1 z-20 list-none",
  option: {
    base:
      "cursor-pointer select-none cursor-default p-2 hover:bg-primary-200 dark:hover:bg-primary-700",
    active: "text-bold",
    inactive: "",
  },
};

const Select: React.FC<SelectProps> = (props) => {
  const { label, name, options } = props;
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <AriaSelect
          className="flex flex-col gap-1 w-full"
          onBlur={onBlur}
          onSelectionChange={onChange}
          defaultSelectedKey={value}
        >
          <Label className="text-white cursor-default">Registration Type</Label>
          <AriaButton className={styles.button.base}  {...{ [DATA_TEST_ID]: props[DATA_TEST_ID] }}>
            <SelectValue className="flex-1 truncate placeholder-shown:italic" />
            <IconChevronDown
              className={styles.button.icon}
              aria-hidden="true"
            />
          </AriaButton>
          <Popover className="w-[--trigger-width]">
            <ListBox className={styles.options}>
              {options.map((opt) => (
                <ListBoxItem
                  id={opt.value}
                  key={opt.value}
                  className={styles.option.base}
                >
                  {({ isSelected }) => (
                    <>
                      <span
                        className={`${styles.option.base} ${
                          isSelected
                            ? styles.option.active
                            : styles.option.inactive
                        }`}
                      >
                        {opt.label}
                      </span>
                    </>
                  )}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </AriaSelect>
      )}
    />
  );
};

export default Select;
