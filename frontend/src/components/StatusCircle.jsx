// frontend/src/components/StatusCircle.jsx

const StatusCircle = ({ color }) => {
    const styles = { backgroundColor: color };

    return color ? (
        <>
        <span className="colored-circle" style={styles} />
        </>
    ) : null;
};

export default StatusCircle;
