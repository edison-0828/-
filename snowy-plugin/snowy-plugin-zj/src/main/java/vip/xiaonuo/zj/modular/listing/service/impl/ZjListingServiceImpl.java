package vip.xiaonuo.zj.modular.listing.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vip.xiaonuo.auth.core.util.StpClientUtil;
import vip.xiaonuo.common.exception.CommonException;
import vip.xiaonuo.zj.modular.listing.entity.ZjListing;
import vip.xiaonuo.zj.modular.listing.entity.ZjListingImage;
import vip.xiaonuo.zj.modular.listing.mapper.ZjListingImageMapper;
import vip.xiaonuo.zj.modular.listing.mapper.ZjListingMapper;
import vip.xiaonuo.zj.modular.listing.param.ZjListingCreateParam;
import vip.xiaonuo.zj.modular.listing.param.ZjListingQueryParam;
import vip.xiaonuo.zj.modular.listing.param.ZjListingReviewParam;
import vip.xiaonuo.zj.modular.listing.service.ZjListingService;
import vip.xiaonuo.zj.modular.user.service.ZjIdentityService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ZjListingServiceImpl extends ServiceImpl<ZjListingMapper, ZjListing> implements ZjListingService {

    private static final String PENDING_REVIEW = "PENDING_REVIEW";
    private static final String PUBLISHED = "PUBLISHED";
    private static final String REJECTED = "REJECTED";

    @Resource
    private ZjListingImageMapper listingImageMapper;

    @Resource
    private ZjIdentityService identityService;

    @Override
    public Page<ZjListing> publicPage(ZjListingQueryParam param) {
        long current = param.getCurrent() == null || param.getCurrent() < 1 ? 1 : param.getCurrent();
        long size = param.getSize() == null ? 20 : Math.min(Math.max(param.getSize(), 1), 50);
        LambdaQueryWrapper<ZjListing> query = new LambdaQueryWrapper<ZjListing>()
                .eq(ZjListing::getStatus, PUBLISHED);
        if (StrUtil.isNotBlank(param.getCity())) query.eq(ZjListing::getCity, param.getCity());
        if (StrUtil.isNotBlank(param.getDistrict())) query.eq(ZjListing::getDistrict, param.getDistrict());
        if (param.getMinRentCents() != null) query.ge(ZjListing::getMonthlyRentCents, param.getMinRentCents());
        if (param.getMaxRentCents() != null) query.le(ZjListing::getMonthlyRentCents, param.getMaxRentCents());
        if (StrUtil.isNotBlank(param.getKeyword())) {
            query.and(item -> item.like(ZjListing::getTitle, param.getKeyword())
                    .or().like(ZjListing::getCommunity, param.getKeyword())
                    .or().like(ZjListing::getDistrict, param.getKeyword()));
        }
        String sort = StrUtil.blankToDefault(param.getSort(), "RECOMMENDED");
        switch (sort) {
            case "RENT_ASC" -> query.orderByAsc(ZjListing::getMonthlyRentCents);
            case "RENT_DESC" -> query.orderByDesc(ZjListing::getMonthlyRentCents);
            case "AVAILABLE_ASC" -> query.orderByAsc(ZjListing::getAvailableFrom);
            default -> query.orderByDesc(ZjListing::getExposureScore).orderByDesc(ZjListing::getCreateTime);
        }
        Page<ZjListing> page = this.page(new Page<>(current, size), query);
        hydrateImages(page.getRecords());
        return page;
    }

    @Override
    public ZjListing publicDetail(String id) {
        ZjListing listing = this.getOne(new LambdaQueryWrapper<ZjListing>()
                .eq(ZjListing::getId, id).eq(ZjListing::getStatus, PUBLISHED));
        if (listing == null) throw new CommonException("房源不存在或已下架");
        hydrateImages(List.of(listing));
        return listing;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public String create(ZjListingCreateParam param) {
        if (!identityService.isCurrentUserVerified()) {
            throw new CommonException(403, "发布房源前请先完成实名认证");
        }
        if (!param.getLeaseEndsAt().isAfter(param.getAvailableFrom())) {
            throw new CommonException("租约到期时间必须晚于可入住时间");
        }
        ZjListing listing = new ZjListing();
        listing.setPublisherId(StpClientUtil.getLoginIdAsString());
        listing.setTitle(param.getTitle().trim());
        listing.setCity(param.getCity().trim());
        listing.setDistrict(param.getDistrict().trim());
        listing.setCommunity(param.getCommunity().trim());
        listing.setMonthlyRentCents(param.getMonthlyRentCents());
        listing.setAvailableFrom(param.getAvailableFrom());
        listing.setLeaseEndsAt(param.getLeaseEndsAt());
        listing.setDescription(param.getDescription());
        listing.setStatus(PENDING_REVIEW);
        listing.setExposureScore(0);
        this.save(listing);
        List<String> imageUrls = param.getImageUrls() == null ? Collections.emptyList() : param.getImageUrls();
        for (int index = 0; index < imageUrls.size(); index++) {
            ZjListingImage image = new ZjListingImage();
            image.setListingId(listing.getId());
            image.setFileUrl(imageUrls.get(index));
            image.setSortCode(index);
            listingImageMapper.insert(image);
        }
        return listing.getId();
    }

    @Override
    public List<ZjListing> myListings() {
        List<ZjListing> listings = this.list(new LambdaQueryWrapper<ZjListing>()
                .eq(ZjListing::getPublisherId, StpClientUtil.getLoginIdAsString())
                .orderByDesc(ZjListing::getCreateTime));
        hydrateImages(listings);
        return listings;
    }

    @Override
    public List<ZjListing> publishedByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyList();
        List<ZjListing> listings = this.list(new LambdaQueryWrapper<ZjListing>()
                .in(ZjListing::getId, ids).eq(ZjListing::getStatus, PUBLISHED));
        hydrateImages(listings);
        Map<String, ZjListing> byId = listings.stream().collect(Collectors.toMap(ZjListing::getId, Function.identity()));
        return ids.stream().map(byId::get).filter(item -> item != null).toList();
    }

    @Override
    public void review(ZjListingReviewParam param) {
        String status = param.getStatus().toUpperCase();
        if (!Set.of(PUBLISHED, REJECTED).contains(status)) {
            throw new CommonException("审核结果只能是PUBLISHED或REJECTED");
        }
        ZjListing listing = this.getById(param.getListingId());
        if (listing == null) throw new CommonException("房源不存在");
        listing.setStatus(status);
        listing.setReviewRemark(param.getRemark());
        this.updateById(listing);
    }

    private void hydrateImages(List<ZjListing> listings) {
        if (listings == null || listings.isEmpty()) return;
        List<String> listingIds = listings.stream().map(ZjListing::getId).toList();
        List<ZjListingImage> images = listingImageMapper.selectList(new LambdaQueryWrapper<ZjListingImage>()
                .in(ZjListingImage::getListingId, listingIds).orderByAsc(ZjListingImage::getSortCode));
        Map<String, List<String>> imageMap = images.stream().collect(Collectors.groupingBy(
                ZjListingImage::getListingId,
                Collectors.mapping(ZjListingImage::getFileUrl, Collectors.toCollection(ArrayList::new))));
        listings.forEach(listing -> listing.setImageUrls(imageMap.getOrDefault(listing.getId(), Collections.emptyList())));
    }
}
