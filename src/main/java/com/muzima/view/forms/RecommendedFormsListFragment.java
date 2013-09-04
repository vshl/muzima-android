package com.muzima.view.forms;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;

import com.muzima.R;
import com.muzima.adapters.forms.DownloadedFormsAdapter;
import com.muzima.api.model.Form;
import com.muzima.controller.FormController;

public class RecommendedFormsListFragment extends FormsListFragment implements NewFormsListFragment.OnTemplateDownloadComplete{

    public static RecommendedFormsListFragment newInstance(FormController formController) {
        RecommendedFormsListFragment f = new RecommendedFormsListFragment();
        f.formController = formController;
        f.setRetainInstance(true);
        return f;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        listAdapter = new DownloadedFormsAdapter(getActivity(), R.layout.item_forms_list, formController);
        noDataMsg = getActivity().getResources().getString(R.string.no_downloaded_form_msg);
        noDataTip = getActivity().getResources().getString(R.string.no_downloaded_form_tip);
        return super.onCreateView(inflater, container, savedInstanceState);
    }

    @Override
    public void onItemClick(AdapterView<?> adapterView, View view, int position, long id) {
        Form form = (Form) listAdapter.getItem(position);
        Intent intent = new Intent(getActivity(), FormWebViewActivity.class);
        intent.putExtra(FormWebViewActivity.FORM_UUID, form.getUuid());
        intent.putExtra(FormWebViewActivity.FORM_DATA_UUID, "patientId");
        startActivity(intent);
    }

    @Override
    public void onTemplateDownloadComplete(Integer[] result) {
        ((FormsActivity)getActivity()).hideProgressbar();
        synchronizationComplete(result);
    }
}