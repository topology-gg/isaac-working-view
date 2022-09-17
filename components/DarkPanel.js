import React from 'react'
import styles from '../styles/DarkPanel.module.css'

const DarkPanel = (props) => {
  return (
    <div className={styles.panel}>{props.children}</div>
  )
}

export default DarkPanel
