'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _editor = require('monaco-editor/esm/vs/editor/editor.api');

var monaco = _interopRequireWildcard(_editor);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function noop() {}

var MonacoDiffEditor = function (_React$Component) {
  _inherits(MonacoDiffEditor, _React$Component);

  function MonacoDiffEditor(props) {
    _classCallCheck(this, MonacoDiffEditor);

    var _this = _possibleConstructorReturn(this, (MonacoDiffEditor.__proto__ || Object.getPrototypeOf(MonacoDiffEditor)).call(this, props));

    _this.assignRef = function (component) {
      _this.containerElement = component;
    };

    _this.containerElement = undefined;
    _this.__current_value = props.value;
    _this.__current_original = props.original;
    return _this;
  }

  _createClass(MonacoDiffEditor, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.initMonaco();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.props.value !== this.__current_value || this.props.original !== this.__current_original) {
        // Always refer to the latest value
        this.__current_value = this.props.value;
        this.__current_original = this.props.original;
        // Consider the situation of rendering 1+ times before the editor mounted
        if (this.editor) {
          this.__prevent_trigger_change_event = true;
          this.updateModel(this.__current_value, this.__current_original);
          this.__prevent_trigger_change_event = false;
        }
      }
      if (prevProps.language !== this.props.language) {
        var _editor$getModel = this.editor.getModel(),
            original = _editor$getModel.original,
            modified = _editor$getModel.modified;

        monaco.editor.setModelLanguage(original, this.props.language);
        monaco.editor.setModelLanguage(modified, this.props.language);
      }
      if (prevProps.theme !== this.props.theme) {
        monaco.editor.setTheme(this.props.theme);
      }
      if (this.editor && (this.props.width !== prevProps.width || this.props.height !== prevProps.height)) {
        this.editor.layout();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.destroyMonaco();
    }
  }, {
    key: 'editorWillMount',
    value: function editorWillMount() {
      var editorWillMount = this.props.editorWillMount;

      var options = editorWillMount(monaco);
      return options || {};
    }
  }, {
    key: 'editorDidMount',
    value: function editorDidMount(editor) {
      var _this2 = this;

      this.props.editorDidMount(editor, monaco);
      editor.onDidUpdateDiff(function () {
        var value = editor.getModel().modified.getValue();

        // Always refer to the latest value
        _this2.__current_value = value;

        // Only invoking when user input changed
        if (!_this2.__prevent_trigger_change_event) {
          _this2.props.onChange(value);
        }
      });
    }
  }, {
    key: 'updateModel',
    value: function updateModel(value, original) {
      var language = this.props.language;

      var originalModel = monaco.editor.createModel(original, language);
      var modifiedModel = monaco.editor.createModel(value, language);
      this.editor.setModel({
        original: originalModel,
        modified: modifiedModel
      });
    }
  }, {
    key: 'initMonaco',
    value: function initMonaco() {
      var value = this.props.value !== null ? this.props.value : this.props.defaultValue;
      var _props = this.props,
          original = _props.original,
          theme = _props.theme,
          options = _props.options;

      if (this.containerElement) {
        // Before initializing monaco editor
        this.editorWillMount();
        this.editor = monaco.editor.createDiffEditor(this.containerElement, options);
        if (theme) {
          monaco.editor.setTheme(theme);
        }
        // After initializing monaco editor
        this.updateModel(value, original);
        this.editorDidMount(this.editor);
      }
    }
  }, {
    key: 'destroyMonaco',
    value: function destroyMonaco() {
      if (typeof this.editor !== 'undefined') {
        this.editor.dispose();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          width = _props2.width,
          height = _props2.height;

      var fixedWidth = (0, _utils.processSize)(width);
      var fixedHeight = (0, _utils.processSize)(height);
      var style = {
        width: fixedWidth,
        height: fixedHeight
      };

      return _react2.default.createElement('div', { ref: this.assignRef, style: style, className: 'react-monaco-editor-container' });
    }
  }]);

  return MonacoDiffEditor;
}(_react2.default.Component);

MonacoDiffEditor.propTypes = {
  width: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
  height: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
  original: _propTypes2.default.string,
  value: _propTypes2.default.string,
  defaultValue: _propTypes2.default.string,
  language: _propTypes2.default.string,
  theme: _propTypes2.default.string,
  options: _propTypes2.default.object,
  editorDidMount: _propTypes2.default.func,
  editorWillMount: _propTypes2.default.func,
  onChange: _propTypes2.default.func
};

MonacoDiffEditor.defaultProps = {
  width: '100%',
  height: '100%',
  original: null,
  value: null,
  defaultValue: '',
  language: 'javascript',
  theme: null,
  options: {},
  editorDidMount: noop,
  editorWillMount: noop,
  onChange: noop
};

exports.default = MonacoDiffEditor;