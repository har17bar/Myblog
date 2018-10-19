$(document).ready(() => {
  $('.delete-article').click(function(e) {
    const id = $(e.target).attr('data-id');
    if (confirm('Are you sure you want to delete this article')) {
      $.ajax({
        type: 'DELETE',
        url: '/articles/' + id,
        success: res => {
          window.location.href = '/';
        },
        error: err => {
          console.log(err);
        }
      });
    }
  });
});
