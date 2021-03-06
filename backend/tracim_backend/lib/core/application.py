import typing
from copy import copy

from tracim_backend.exceptions import AppDoesNotExist
from tracim_backend.app_models.workspace_menu_entries import WorkspaceMenuEntry
from tracim_backend.app_models.workspace_menu_entries import dashboard_menu_entry
from tracim_backend.app_models.workspace_menu_entries import all_content_menu_entry


class ApplicationApi(object):

    def __init__(
        self,
        app_list,
        show_all: bool = False,
    ) ->  None:
        self.apps = app_list
        self.show_all = show_all

    def get_one(self, slug):
        for app in self.apps:
            if app.slug == slug:
                return app
        raise AppDoesNotExist('Application {app} does not exist'.format(app=slug))  # nopep8

    def get_all(self):
        active_apps = []
        for app in self.apps:
            if self.show_all or app.is_active:
                active_apps.append(app)

        return active_apps

    def get_content_types(self):
        active_content_types = []
        for app in self.get_all():
            if app.content_types:
                for content_type in app.content_types:
                    active_content_types.append(content_type)
        return active_content_types

    def get_default_workspace_menu_entry(
            self,
            workspace: 'Workspace',
    ) -> typing.List[WorkspaceMenuEntry]:
        """
        Get default menu entry for a workspace
        """
        menu_entries = [
            copy(dashboard_menu_entry),
            copy(all_content_menu_entry),
        ]
        for app in self.get_all():
            if app.main_route:
                new_entry = WorkspaceMenuEntry(
                    slug=app.slug,
                    label=app.label,
                    hexcolor=app.hexcolor,
                    fa_icon=app.fa_icon,
                    route=app.main_route
                )
                menu_entries.append(new_entry)

        for entry in menu_entries:
            entry.route = entry.route.replace(
                '{workspace_id}',
                str(workspace.workspace_id)
            )

        return menu_entries