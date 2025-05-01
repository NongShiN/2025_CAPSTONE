import styles from './Supervisors.module.css';

const SupervisorsPage = () => {
    const supervisors = [
        {
            title: "ACT - Acceptance and Commitment Therapy",
            content: "ACT helps you accept what is out of your control and commit to actions that improve your life."
        },
        {
            title: "CBT - Cognitive Behavioral Therapy",
            content: "CBT focuses on identifying and changing negative thought patterns to improve mental well-being."
        },
        {
            title: "IPT - Interpersonal Therapy",
            content: "IPT aims to improve interpersonal relationships and communication to help manage emotional challenges."
        }
    ];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Meet Our Supervisors</h1>
            {supervisors.map((item, index) => (
                <div key={index} className={styles.card}>
                    <h2 className={styles.heading}>{item.title}</h2>
                    <p className={styles.content}>{item.content}</p>
                </div>
            ))}
        </div>
    );
};

export default SupervisorsPage;
