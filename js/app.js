$(() => {
  'use strict';
  let head = new GitGraph();
  let branches = {};
  let branch;

  function cli(input) {
    $('#cli-response').text('');
    let args = input.split(/ +/);
    switch (args[1]) {
      case 'commit':
        if (branch == undefined) {
          console.log('no branch!!');
          return;
        }

        if (args[2] == '-m' && args.length >= 3) {
          let message = args[3];
          head.commit(message.replace(/^['"]|['"]$/g, ''));
        } else {
          head.commit();
        }
        break;
      case 'branch':
        if (args.length == 2) {
          let response = '';
          Object.keys(branches).forEach((b) => {
            response = `${response}<div>${b}</div>`;
          });
          $('#cli-response').html(response || 'git-graph-cli: no branch exists');
          return;
        } else {
          branches[args[2]] = head.branch(args[2]);
        }
        break;
      case 'checkout':
        if (args[2] == '-b' && args.length >= 3) {
          branches[args[3]] = head.branch(args[3]);
          branch = args[3];
          $('#branch-name').text(branch);
        } else {
          if (branches[args[2]] == undefined) {
            alert(`branch: ${args[2]} is not exist`);
            return;
          }
          branch = args[2];
          $('#branch-name').text(branch);
        }
        break;
      case 'merge':
        let mergeBranch = args[2];
        branches[mergeBranch].merge(branches[branch]);
        break;
      default:
        $('#cli-response').text(`git-graph-cli: '${args[1]}' is not valid option. See 'help'`);
        return;
    }
    $('#cli-txt').val('');
  }

  let $cliTxt = $('.cli-txt');
  $cliTxt.focus();

  $cliTxt.keypress((event) => {
    if (event.which == 13) {
      cli($cliTxt.val());
    }
  });

});
