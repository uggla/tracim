import i18n from './i18n.js'
import {
  addAllResourceI18n,
  handleFetchResult,
  displayDistanceDate,
  convertBackslashNToBr,
  revisionTypeList,
  generateLocalStorageContentId
} from './helper.js'

import PopinFixed from './component/PopinFixed/PopinFixed.jsx'
import PopinFixedHeader from './component/PopinFixed/PopinFixedHeader.jsx'
import PopinFixedOption from './component/PopinFixed/PopinFixedOption.jsx'
import PopinFixedContent from './component/PopinFixed/PopinFixedContent.jsx'

import Avatar from './component/Avatar/Avatar.jsx'
import Badge from './component/Badge/Badge.jsx'

import Timeline from './component/Timeline/Timeline.jsx'

import TextAreaApp from './component/Input/TextAreaApp/TextAreaApp.jsx'
import BtnSwitch from './component/Input/BtnSwitch/BtnSwitch.jsx'
import Checkbox from './component/Input/Checkbox.jsx'

import PageWrapper from './component/Layout/PageWrapper.jsx'
import PageTitle from './component/Layout/PageTitle.jsx'
import PageContent from './component/Layout/PageContent.jsx'

import Delimiter from './component/Delimiter/Delimiter.jsx'

import CardPopup from './component/CardPopup/CardPopup.jsx'
import CardPopupCreateContent from './component/CardPopup/CardPopupCreateContent.jsx'

import NewVersionBtn from './component/OptionComponent/NewVersionBtn.jsx'
import ArchiveDeleteContent from './component/OptionComponent/ArchiveDeleteContent.jsx'
import SelectStatus from './component/Input/SelectStatus/SelectStatus.jsx'

import NewMemberForm from './component/NewMemberForm/NewMemberForm.jsx'

const customEventReducer = ({ detail: { type, data } }) => { // action: { type: '', data: {} }
  switch (type) {
    case 'allApp_changeLang': i18n.changeLanguage(data); break
    default: break
  }
}

document.addEventListener('appCustomEvent', customEventReducer)

export const enTranslation = require('../i18next.scanner/en/translation.json')
export const frTranslation = require('../i18next.scanner/fr/translation.json')

export {
  addAllResourceI18n,
  handleFetchResult,
  displayDistanceDate,
  convertBackslashNToBr,
  revisionTypeList,
  generateLocalStorageContentId,
  PopinFixed,
  PopinFixedHeader,
  PopinFixedOption,
  PopinFixedContent,
  Avatar,
  Badge,
  Timeline,
  TextAreaApp,
  BtnSwitch,
  Checkbox,
  PageWrapper,
  PageTitle,
  PageContent,
  Delimiter,
  CardPopup,
  CardPopupCreateContent,
  NewVersionBtn,
  ArchiveDeleteContent,
  SelectStatus,
  NewMemberForm
}

