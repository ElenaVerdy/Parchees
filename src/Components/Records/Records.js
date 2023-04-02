import './Records.css'

import React, { useState } from 'react'

import ChipIcon from 'assets/icons/chip.svg'
import Modal from 'react-modal'
import StarIcon from 'assets/icons/star.svg'
import Switch from 'ui/switch/Switch'
import { useSelector } from 'react-redux'

Modal.setAppElement('#root')

const RATING_TAB_ID = 'rating'
const CHIPS_TAB_ID = 'chips'

const tabs = [
    {
        name: 'Рейтинг',
        icon: StarIcon,
        id: RATING_TAB_ID
    }, {
        name: 'Фишки',
        icon: ChipIcon,
        id: CHIPS_TAB_ID
    }
]

export default function Records (props){
    const topByRank = useSelector(state => state.ratings.topByRank)
    const topByChips = useSelector(state => state.ratings.topByChips)
    const [tab, setTab] = useState(tabs[0].id)

    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.setIsOpen.bind(null, false)}
            className={'modal records_modal'}
            closeTimeoutMS={300}
            contentLabel="Example Modal"
        >
            <div className="records_header">Доска почёта</div>
            <div className="records_main">
                <Switch
                    tabs={tabs}
                    activeTab={tab}
                    setActiveTab={setTab}
                />
                {tab === RATING_TAB_ID ? (
                    <div className="records_main-wrapper">
                        {topByRank.map((item, i) => {
                            return (
                                <div
                                    key={ item.vk_id }
                                    className={`records_record-wrapper${getRecordWrapperClass(i)} flex`}
                                >
                                    <div className="records_num">{ i + 1 }</div>
                                    <div className='records_photo'><img src={ item.photo_50 } alt={ `${item.first_name} ${item.last_name}` } height="25" width="25"/></div>
                                    <div className='records_name flex-grow'>{ `${item.first_name} ${item.last_name}` }</div>
                                    <div className='lobby-header_rank'><div className="records_tab-icon records_tab-icon-rating flex-center">{ item.rating }</div></div>
                                </div>
                            )
                        })}
                    </div>
                ) : null}
                {tab === CHIPS_TAB_ID ? (
                    <div className="records_main-wrapper">
                        {topByChips.map((item, i) => {
                            return (
                                <div
                                    key={ item.id }
                                    className={`records_record-wrapper${getRecordWrapperClass(i)} flex`}
                                >
                                    <div className="records_num">{ i + 1 }</div>
                                    <div className='records_photo'><img src={ item.photo_50 } alt={ `${item.first_name} ${item.last_name}` } height="25" width="25"/></div>
                                    <div className='records_name flex-grow'>{ `${item.first_name} ${item.last_name}` }</div>
                                    <div className='lobby-header_chips'><div className="records_tab-icon records_tab-icon-chips flex-center">{ item.chips }</div></div>
                                </div>
                            )
                        })}
                    </div>
                ) : null}
            </div>
            <button className="shop_close-btn btn-brown" onClick={props.setIsOpen.bind(this, false)}>закрыть</button>
        </Modal>
    )
}

function getRecordWrapperClass (index) {
    if (index === 0) {
        return ' records_record-wrapper__gold'
    }

    if (index === 1) {
        return ' records_record-wrapper__silver'
    }

    if (index === 2) {
        return ' records_record-wrapper__bronze'
    }

    return ''
}