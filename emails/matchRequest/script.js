function reply(id, success) {
  console.log(id);
  const url = success ? "confirm" : "deny";
  var req = new XMLHttpRequest();
  req.open("POST", "http://192.168.1.122:8081/connect/" + url);
  req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  req.onreadystatechange = response;

  function response(res) {
    req.responseText;
  }

  req.send(JSON.stringify({ matchId: id }));
}
