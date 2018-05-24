import React from 'react'
import { connect } from 'react-redux'
import appFactory from '../appFactory.js'
import { PAGE } from '../helper.js'
import Sidebar from './Sidebar.jsx'
import Folder from '../component/Workspace/Folder.jsx'
import ContentItem from '../component/Workspace/ContentItem.jsx'
import ContentItemHeader from '../component/Workspace/ContentItemHeader.jsx'
import PageWrapper from '../component/common/layout/PageWrapper.jsx'
import PageTitle from '../component/common/layout/PageTitle.jsx'
import PageContent from '../component/common/layout/PageContent.jsx'
import DropdownCreateButton from '../component/common/Input/DropdownCreateButton.jsx'
import PopupCreateContent from '../component/PopupCreateContent/PopupCreateContainer.jsx'
import {
  getAppList,
  getWorkspaceContent,
  getFolderContent
} from '../action-creator.async.js'
import {
  newFlashMessage,
  setWorkspaceData
} from '../action-creator.sync.js'

const qs = require('query-string')

class WorkspaceContent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      popupCreateContent: {
        display: false,
        type: undefined,
        folder: undefined
      }
    }
  }

  async componentDidMount () {
    const { workspaceList, app, match, location, dispatch } = this.props

    if (Object.keys(app).length === 0) dispatch(getAppList()) // async but no need await

    let wsToLoad = null
    if (match.params.idws !== undefined) wsToLoad = match.params.idws
    else if (workspaceList.length > 0) wsToLoad = workspaceList[0].id // load first ws if none specified

    if (wsToLoad === null) return // ws already loaded

    const wsContent = await dispatch(getWorkspaceContent(wsToLoad))
    if (wsContent.status === 200) {
      dispatch(setWorkspaceData(wsContent.json, qs.parse(location.search).type))

      if (match.params.idcts) { // if a content id is in url, open it
        const contentToOpen = wsContent.json.content.find(wsc => wsc.id === parseInt(match.params.idcts))
        if (contentToOpen === undefined) return

        this.handleClickContentItem(contentToOpen)
      }
    } else dispatch(newFlashMessage('Error while loading workspace', 'danger'))
  }

  handleClickContentItem = content => {
    this.props.history.push(`${PAGE.WORKSPACE.CONTENT(content.workspace_id, content.id)}${this.props.location.search}`)
    this.props.renderApp(this.props.app[content.type], this.props.user, {...content, workspace: this.props.workspace})
  }

  handleClickEditContentItem = (e, content) => {
    e.stopPropagation()
    console.log('edit nyi', content)
  }

  handleClickMoveContentItem = (e, content) => {
    e.stopPropagation()
    console.log('move nyi', content)
  }

  handleClickDownloadContentItem = (e, content) => {
    e.stopPropagation()
    console.log('download nyi', content)
  }

  handleClickArchiveContentItem = (e, content) => {
    e.stopPropagation()
    console.log('archive nyi', content)
  }

  handleClickDeleteContentItem = (e, content) => {
    e.stopPropagation()
    console.log('delete nyi', content)
  }

  handleClickFolder = folderId => {
    this.props.dispatch(getFolderContent(this.props.workspace.id, folderId))
  }

  handleClickCreateContent = (folder, contentType) => this.setState({
    popupCreateContent: {
      display: true,
      type: contentType,
      folder: folder
    }
  })

  handleClosePopupCreateContent = () => this.setState({
    popupCreateContent: {
      display: false,
      type: undefined,
      folder: undefined
    }
  })

  render () {
    const { workspace, app } = this.props

    const filterWorkspaceContent = (contentList, filter) => filter.length === 0
      ? contentList
      : contentList.filter(c => c.type === 'folder' || filter.includes(c.type)) // keep unfiltered files and folders
        .map(c => c.type !== 'folder' ? c : {...c, content: this.filterWorkspaceContent(c.content, filter)}) // recursively filter folder content
    // .filter(c => c.type !== 'folder' || c.content.length > 0) // remove empty folder => 2018/05/21 - since we load only one lvl of content, don't remove empty folders

    const filteredWorkspaceContent = filterWorkspaceContent(workspace.content, workspace.filter)

    return (
      <div className='sidebarpagecontainer'>
        <Sidebar />

        <PageWrapper customeClass='workspace'>
          <PageTitle
            parentClass='workspace__header'
            customClass='justify-content-between'
            title={workspace.title}
          >
            <DropdownCreateButton parentClass='workspace__header__btnaddworkspace' />
          </PageTitle>

          <PageContent parentClass='workspace__content'>
            { this.state.popupCreateContent.display &&
              <PopupCreateContent
                type={this.state.popupCreateContent.type}
                folder={this.state.popupCreateContent.folder}
                onClose={this.handleClosePopupCreateContent}
              />
            }

            <div className='workspace__content__fileandfolder folder__content active'>
              <ContentItemHeader />

              { filteredWorkspaceContent.map((c, i) => c.type === 'folder'
                ? (
                  <Folder
                    app={app}
                    folderData={c}
                    onClickItem={this.handleClickContentItem}
                    onClickExtendedAction={{
                      edit: this.handleClickEditContentItem,
                      move: this.handleClickMoveContentItem,
                      download: this.handleClickDownloadContentItem,
                      archive: this.handleClickArchiveContentItem,
                      delete: this.handleClickDeleteContentItem
                    }}
                    onClickFolder={this.handleClickFolder}
                    onClickCreateContent={this.handleClickCreateContent}
                    isLast={i === filteredWorkspaceContent.length - 1}
                    key={c.id}
                  />
                )
                : (
                  <ContentItem
                    name={c.title}
                    type={c.type}
                    icon={(app[c.type] || {icon: ''}).icon}
                    status={c.status}
                    onClickItem={() => this.handleClickContentItem(c)}
                    onClickExtendedAction={{
                      edit: e => this.handleClickEditContentItem(e, c),
                      move: e => this.handleClickMoveContentItem(e, c),
                      download: e => this.handleClickDownloadContentItem(e, c),
                      archive: e => this.handleClickArchiveContentItem(e, c),
                      delete: e => this.handleClickDeleteContentItem(e, c)
                    }}
                    isLast={i === filteredWorkspaceContent.length - 1}
                    key={c.id}
                  />
                )
              )}
            </div>

            <DropdownCreateButton customClass='workspace__content__button mb-5' />

            <div id='appContainer' />
          </PageContent>

        </PageWrapper>
      </div>
    )
  }
}

const mapStateToProps = ({ user, workspace, workspaceList, app }) => ({ user, workspace, workspaceList, app })
export default connect(mapStateToProps)(appFactory(WorkspaceContent))
