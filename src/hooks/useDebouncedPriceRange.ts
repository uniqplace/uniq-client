import { useState, useEffect, useRef } from 'react';

export function useDebouncedPriceRange(priceRange: [number, number], setPriceRange: (range: [number, number]) => void, minProductPrice: number, maxProductPrice: number) {
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>(priceRange);
  const [inputMin, setInputMin] = useState<string>(priceRange[0].toString());
  const [inputMax, setInputMax] = useState<string>(priceRange[1].toString());
  const debounceTimeout = useRef<number | null>(null);
  const inputDebounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    setTempPriceRange(priceRange);
    setInputMin(priceRange[0].toString());
    setInputMax(priceRange[1].toString());
  }, [priceRange]);

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = window.setTimeout(() => {
      setPriceRange(
        tempPriceRange[0] > tempPriceRange[1]
          ? [tempPriceRange[1], tempPriceRange[0]]
          : tempPriceRange
      );
    }, 400);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [tempPriceRange, setPriceRange]);

  useEffect(() => {
    if (inputDebounceTimeout.current) clearTimeout(inputDebounceTimeout.current);
    inputDebounceTimeout.current = window.setTimeout(() => {
      let min = Math.max(minProductPrice, Number(inputMin));
      let max = Math.min(maxProductPrice, Number(inputMax));
      if (max < min) {
        [min, max] = [max, min];
      }
      setTempPriceRange([min, max]);
    }, 400);
    return () => {
      if (inputDebounceTimeout.current) clearTimeout(inputDebounceTimeout.current);
    };
  }, [inputMin, inputMax, minProductPrice, maxProductPrice]);

  return {
    tempPriceRange,
    setTempPriceRange,
    inputMin,
    setInputMin,
    inputMax,
    setInputMax,
  };
}
