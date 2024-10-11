import { useState } from 'react';

export function useSampleHook() {
    const [count, setCount] = useState(0);
    return { count, setCount };
}
