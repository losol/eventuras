import styles from './Spinner.module.scss';

function Spinner({ style }: { style?: React.CSSProperties }) {
  return (
    <div className={styles.box} {...(style && { style })}>
      <div className={styles.border} />
    </div>
  );
}

export default Spinner;
