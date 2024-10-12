import { useAppStore } from '../store/useAppStore';

export default function HomePage() {
    const { user, setUser } = useAppStore();

    return (
        <div>
            <h1>Главная страница</h1>
            <p>Пользователь: {user ? user : 'Не авторизован'}</p>
            <button onClick={() => setUser(user ? null : 'Пользователь')}>
                {user ? 'Выйти' : 'Войти'}
            </button>
        </div>
    );
}
