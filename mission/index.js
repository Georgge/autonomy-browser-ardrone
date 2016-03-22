module.exports = function(parrot){
    parrot.takeoff()
        .hover(1000)
        .forward(1)
        .hover(1000)
        .land();
    parrot.run(function(err, result){
        if(err){
           io.emit('autonomy', 'error' + err);
           parrot.client.land();
        } else {
           console.log('finalizado')
        }
    })
}