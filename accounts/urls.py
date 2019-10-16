from accounts.views import ProfileView
from django.contrib.auth import views as auth_views
from django.urls import path

app_name = 'accounts'
urlpatterns = [
    path(
        'login/',
        auth_views.LoginView.as_view(template_name='login.html'),
        name='login',
    ),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path(
        'change-password/',
        auth_views.PasswordChangeView.as_view(
            template_name='password_change.html'
        ),
        name='password_change',
    ),
    path(
        'change-password/done',
        auth_views.PasswordChangeDoneView.as_view(
            template_name='password_change_done.html'
        ),
        name='password_change_done',
    ),
    # path(
    #     'reset-password/',
    #     auth_views.PasswordResetView.as_view(
    #         template_name='password_reset.html'
    #     ),
    #     name='password_reset',
    # ),
    # path(
    #     'reset-password/done/',
    #     auth_views.PasswordResetDoneView.as_view(
    #         template_name='password_reset_done.html'
    #     ),
    #     name='password_reset_done',
    # ),
    # path(
    #     'reset/<str:uidb64>/<str:token>/',
    #     auth_views.PasswordResetConfirmView.as_view(
    #         template_name='password_reset_confirm.html'
    #     ),
    #     name='password_reset_confirm',
    # ),
    # path(
    #     'reset/done/',
    #     auth_views.PasswordResetCompleteView.as_view(
    #         template_name='password_reset_complete.html'
    #     ),
    #     name='password_reset_complete',
    # ),
]
