import React, { useState } from 'react';

const CreateBotForm: React.FC = () => {
    const [botName, setBotName] = useState('');
    const [botUsername, setBotUsername] = useState('');
    const [botToken, setBotToken] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await fetch('/api/create-bot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ botName, botUsername }),
            });

            const data = await response.json();

            if (data.success) {
                setBotToken(data.botToken);
                setError('');
            } else {
                setError(data.message);
                setBotToken('');
            }
        } catch (err) {
            setError('An error occurred while creating the bot.');
            setBotToken('');
        }
    };

    return (
        <div>
            <h2>Create a New Telegram Bot</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Bot Name:</label>
                    <input
                        type="text"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Bot Username:</label>
                    <input
                        type="text"
                        value={botUsername}
                        onChange={(e) => setBotUsername(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Bot</button>
            </form>
            {botToken && (
                <div>
                    <h3>Bot Created Successfully!</h3>
                    <p>Your bot token: {botToken}</p>
                </div>
            )}
            {error && (
                <div>
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default CreateBotForm;
