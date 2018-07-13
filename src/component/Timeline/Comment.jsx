import React from 'react'
import classnames from 'classnames'

const Comment = props => (
  <li className={classnames(
    `${props.customClass}__messagelist__item`,
    'timeline__body__messagelist__item', {
      'received': props.fromMe, // @FIXME : invert names of class (received should be !fromMe)
      'sended': !props.fromMe
    }
  )}>
    <div className={classnames(`${props.customClass}__messagelist__item__wrapper`, 'timeline__body__messagelist__item__wrapper')}>
      <div className={classnames(`${props.customClass}__messagelist__item__avatar`, 'timeline__body__messagelist__item__avatar')}>
        {props.avatar ? <img src={props.avatar} /> : ''}
      </div>
    </div>
    <div
      className={classnames(`${props.customClass}__messagelist__item__createhour`, 'timeline__body__messagelist__item__createhour')}>
      {props.createdAt}
    </div>
    <div
      className={classnames(`${props.customClass}__messagelist__item__content`, 'timeline__body__messagelist__item__content')}
      dangerouslySetInnerHTML={{__html: props.text}}
    />
  </li>
)

export default Comment
