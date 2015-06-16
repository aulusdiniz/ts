function commentAndVote(vote) {
  $.ajax({
    url: '/voting/:id',
    type: 'POST',
    data: {
      comment: $('textarea#comment_vote').val(),
      vote: vote
    },
    success	: function(responseText, status, xhr, $form){
      console.log('comentário publicado com sucesso!');
      location.reload();
    },
    error : function(e){
      console.log('publicação de comentário falhou : ' + e.responseText );
    }
  });
}
