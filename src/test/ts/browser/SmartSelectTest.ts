import { UnitTest, assert } from '@ephox/bedrock';
import { Result } from '@ephox/katamari';
import DomSmartSelect from 'ephox/robin/api/dom/DomSmartSelect';
import { Body, Compare, Element, Hierarchy, Insert, InsertAll, Remove } from '@ephox/sugar';

UnitTest.test('SmartSelectTest', function () {
  var editor = Element.fromTag('div');

  /*
   * We_
   * <p>
   *  are_
   *  <span>
   *    g
   *  </span>
   *  oi
   *  <b>
   *    ng
   *  </b>
   * </p>
   * <p>
   *  to_say
   *  _
   *  "yes"
   * </p>
   */
  var populate = function () {
    var we = Element.fromText('We ');
    var p1 = Element.fromTag('p');
    var are = Element.fromText('are ');
    var s1 = Element.fromTag('span');
    var g = Element.fromText('g');
    var oi = Element.fromText('oi');
    var b1 = Element.fromTag('b');
    var ng = Element.fromText('ng');
    var p2 = Element.fromTag('p');
    var toSay = Element.fromText('to say');
    var space = Element.fromText(' ');
    var yes = Element.fromText('"yes"');

    InsertAll.append(p1, [are, s1, oi, b1]);
    InsertAll.append(p2, [toSay, space, yes]);
    InsertAll.append(s1, [g]);
    InsertAll.append(b1, [ng]);
    InsertAll.append(editor, [we, p1, p2]);
    Insert.append(Body.body(), editor);
  };

  var cleanup = function () {
    Remove.remove(editor);
  };

  var check = function (expected, path, offset) {
    var start = Hierarchy.follow(editor, path, 'Looking for start of smart select').getOrDie();
    var actual = DomSmartSelect.word(start, offset);
    actual.fold(function () {
      throw 'Expected to select word: ' + expected.word;
    }, function (act) {
      var expStart = Hierarchy.follow(editor, expected.start.element, 'Could not find expected start').getOrDie();
      var expFinish = Hierarchy.follow(editor, expected.finish.element, 'Could not find expected finish').getOrDie();
      assert.eq(true, Compare.eq(expStart, act.startContainer()));
      assert.eq(expected.start.offset, act.startOffset());
      assert.eq(true, Compare.eq(expFinish, act.endContainer()));
      assert.eq(expected.finish.offset, act.endOffset());

      var range = document.createRange();
      range.setStart(act.startContainer().dom(), act.startOffset());
      range.setEnd(act.endContainer().dom(), act.endOffset());
      assert.eq(expected.word, range.toString());
    });
  }

  var words = {
    we: {
      start: { element: [0], offset: 0 },
      finish: { element: [0], offset: 'We'.length },
      word: 'We'
    },
    are: {
      start: { element: [1, 0], offset: 0 },
      finish: { element: [1, 0], offset: 'are'.length },
      word: 'are'
    },
    going: {
      start: { element: [1, 1, 0], offset: ''.length },
      finish: { element: [1, 3, 0], offset: 'ng'.length },
      word: 'going'
    },
    to: {
      start: { element: [2, 0], offset: ''.length },
      finish: { element: [2, 0], offset: 'to'.length },
      word: 'to'
    },
    say: {
      start: { element: [2, 0], offset: 'to '.length },
      finish: { element: [2, 0], offset: 'to say'.length },
      word: 'say'
    },
    yes: {
      start: { element: [2, 2], offset: '"'.length },
      finish: { element: [2, 2], offset: '"yes'.length },
      word: 'yes'
    }
  }

  populate();

  check(words.we, [0], 1);
  check(words.are, [1, 0], 1);
  check(words.are, [1, 0], 2);
  check(words.going, [1, 1, 0], 1);
  check(words.to, [2, 0], 1);
  check(words.say, [2, 0], 'to s'.length);
  check(words.yes, [2, 2], '"y'.length)

  cleanup();
});
