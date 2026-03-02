export const getClasses = async () => {
    try {
        const res = await fetch('/api/classes');
        if (!res.ok) throw new Error('Error fetching classes');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        return [];
    }
};

export const saveClass = async (newClass) => {
    try {
        const res = await fetch('/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newClass)
        });
        if (!res.ok) throw new Error('Error saving class');
        return await getClasses();
    } catch (err) {
        console.error(err);
        return await getClasses();
    }
};

export const deleteClass = async (id) => {
    try {
        const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error deleting class');
        return await getClasses();
    } catch (err) {
        console.error(err);
        return await getClasses();
    }
};
