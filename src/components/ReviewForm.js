import React, { useState } from 'react';

function ReviewForm({ onSubmit, initialContent = '' }) {
    const [content, setContent] = useState(initialContent);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content);
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="리뷰를 작성해주세요."
                style={{ width: '100%', minHeight: '80px' }}
                required
            />
            <button type="submit">리뷰 등록</button>
        </form>
    );
}

export default ReviewForm;