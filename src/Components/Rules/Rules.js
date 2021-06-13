import React from 'react'
import Modal from 'react-modal'
import './Rules.css'

Modal.setAppElement('#root')

export default function Rules (props){
    return (
        <Modal
            isOpen={props.isOpen}
            onRequestClose={props.setIsOpen.bind(null, false)}
            className={'modal rules_modal'}
            closeTimeoutMS={300}
            contentLabel="Example Modal"
        >
            <div className="records_header">
                <span className="rules_chip-icon player-info_chip-icon_1"></span>
                <span className="rules_chip-icon player-info_chip-icon_2"></span>
				Добро пожаловать!
                <span className="rules_chip-icon player-info_chip-icon_3"></span>
                <span className="rules_chip-icon player-info_chip-icon_4"></span>
            </div>
            <div className="rules_main">
                <p className="rules_p">Парчис - это одна из самых древних, и в то же время самых простых игр в мире.</p>
                <p className="rules_p">Цель игры - провести все свои фишки, как минимум, один круг по полю и завести их домой раньше соперника.</p>
                <p className="rules_p">По пути вы можете есть фишки врага, прятаться в засаде, хитрить, и срезать путь.</p>
                <ul className="margin-t-5">
                    <span className="rules_li">Основные правила:</span>
                    <li className="rules_li">Каждый ход Игрока начинается с броска кубиков. Для зарядки фишки, которая находится на базе, необходимо выбросить шестёрку.
							Далее Игрок передвигает фишки насколько позволяют кубики</li>
                    <li className="rules_li">Если ход Игрока заканчивается на клетке, где стоит соперник, - что ж, так тому и быть. Враг съеден.</li>
                    <li className="rules_li">Перепрыгивать через свои или чужие фишки нельзя. Стоять вдвоем на одной клетке тоже.</li>
                    <li className="rules_li">Если ход Игрока заканчивается на клетке под номером 2, он может, но не обязан, скатиться по стрелочке на 9.</li>
                    <li className="rules_li">Если ход Игрока заканчивается на клетке под номером 6, и в следующий ход он выкидывает 1 - он может воспользоваться стрелочкой прямо, если 3 - по диагонали.</li>
                    <li className="rules_li">Если ход Игрока заканчивается на клетке под номером 10, он может, но не обязан, спрятаться в домик. Там его нельзя скушать, но, если на клетке 10 будет стоять другая фишка, - он не сможет выйти.</li>
                    <li className="rules_li">Если у вас остались не использованные ходы, вы не сможете завершить ход, за исключением случаев, когда единственный доступный ход отправит вас на лишний круг или когда доступных ходов нет.</li>
                    <li className="rules_li">Если вы выбросили дубль, вы можете бросить кубики еще раз. Кубики выброшенные с помощью чита не считаются.</li>
                    <li className="rules_li">Читы &quot;Щит&quot; и &quot;Полёт&quot; длятся три раунда (раундом считается период за который каждый игрок успел сходить один раз).</li>
                    <li className="rules_li">Читы &quot;Стрелочник&quot; и &quot;Тернистый путь&quot; прекращают действовать только если на ту же фишку наложен противоположный чит.</li>
                </ul>
            </div>
            <button className="shop_close-btn btn-brown" onClick={props.setIsOpen.bind(this, false)}>готов играть</button>
        </Modal>
    )
}