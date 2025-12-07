'use client'
import { useAsyncList } from 'react-stately';

import { FocusEventHandler, ReactElement, useRef, useState } from "react";
import { Button, ComboBox, Input, Label, ListBox, ListBoxItem, Popover } from 'react-aria-components';
import { Loading } from '../../core/Loading'

export type AutoCompleteItem = {
  id: any;
  label: string;
  original: any;
};

export type AutoCompleteDataProviderResult = {
  ok: boolean;
  value: AutoCompleteItem[] | null;
  error: Error | null;
};

export type AutoCompleteDataProvider = (input: string) => Promise<AutoCompleteDataProviderResult>;

export type InputAutoCompleteProps = {
  id?: string;
  placeholder?: string;
  dataProvider: AutoCompleteDataProvider;
  minimumAmountOfCharacters: number;
  itemRenderer?: (item: AutoCompleteItem, selected?: boolean, active?: boolean) => ReactElement
  onItemSelected?: (u: { id: any }) => Promise<any> | void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  ready?: boolean;
};

export const InputAutoComplete = (props: InputAutoCompleteProps) => {
  const createSet = (values: AutoCompleteItem[]) => ({ items: values })
  const localCache = useRef<Map<string, AutoCompleteItem[]>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);

  const list = useAsyncList<AutoCompleteItem>({
    async load({filterText}: { filterText?: string }) {
      if ((filterText ?? '').length < props.minimumAmountOfCharacters) {
        return createSet([
          {
            id: -1,
            label: `Type at least ${props.minimumAmountOfCharacters} characters`,
            original: null
          }
        ])
      }
      const cacheHit = localCache.current.get(filterText!);

      if (cacheHit) {
        return createSet(cacheHit)
      }
      setLoading(true)
      const res = await props.dataProvider(filterText ?? '')
      setLoading(false)
      if (res.ok) {
        localCache.current.set(filterText!, res.value!)
        return createSet(res.value!)
      } else {
        return createSet([])
      }
    }
  });
  return <div>
    <ComboBox
      className="group flex flex-col p-4"
      items={list.items}
      inputValue={list.filterText}
      disabledKeys={[-1]}
      onInputChange={(value) => { list.setFilterText(value) }}
      onSelectionChange={(key) => {
        if (props.onItemSelected) {
          const item = list.items.filter((i: AutoCompleteItem) => i.id === key)[0]
          if (item) {
            props.onItemSelected(item.original);

          }
        }
        return key
      }}
      allowsCustomValue
      menuTrigger='focus'
    >
      <Label className="text-black cursor-default">{props.placeholder}</Label>
      <div className="flex flex-row">
        <Input className="border-none py-2 pl-3 pr-2 text-sm leading-5 text-gray-900" />

        {
          !loading ? <Button className="text-white p-2 bg-primary-600">▼</Button> : <div className="scale-[0.8] top-[-5px]">
            <Loading />
          </div>
        }
      </div>
      <Popover className="ml-[-12px] max-h-60 w-(--trigger-width) overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
        <ListBox className="outline-hidden">
          {(item: AutoCompleteItem) => <ListBoxItem textValue={item.label} className="group flex items-center gap-2 cursor-default select-none py-2 pl-2 pr-4 outline-hidden rounded-xs text-gray-900 focus:bg-sky-600 focus:text-white"
            id={item.id} key={item.id}>
            {props.itemRenderer ? props.itemRenderer(item) : item.label}

          </ListBoxItem>}
        </ListBox>
      </Popover>
    </ComboBox>
  </div >
}
