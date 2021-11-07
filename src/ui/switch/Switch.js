import React from 'react'
import './Switch.css'

export default function Switch ({ tabs, activeTab, setActiveTab }){
    return (
        <div className="switch flex-center">
            {tabs.map(({ id, name, icon }) => (
                <div
                    className={`pointer switch__item${id === activeTab ? ' switch__item--selected' : ''}`}
                    onClick={setActiveTab.bind(null, id)}
                    key={id}
                >
                    {icon
                        ? <img
                            className={'switch__item-icon'}
                            src={icon}
                        />
                        : null}
                    { name }
                </div>
            ))}
        </div>
    )
}