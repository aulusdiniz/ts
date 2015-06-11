function commentAndVote(vote) {
  $.ajax({
    url: '/voting/:id',
    type: 'POST',
    data: {
      user_guest: $('input#userId').val(),
      comment: $('textarea#comment_vote').val(),
      vote: vote
    },
    success	: function(responseText, status, xhr, $form){
      console.log($('input#userId').val());
      console.log($('textarea#comment_vote').val());
      console.log(vote);
      console.log('comentário publicado com sucesso!');
      // window.location = window.location.protocol + '//' + window.location.hostname+ ':8080' + '/profile';
      // window.history(0);
    },
    error : function(e){
      console.log($('input#userId').val());
      console.log($('textarea#comment_vote').val());
      console.log(vote);
      console.log('publicação de comentário falhou : ' + e.responseText );
    }
  });
}
